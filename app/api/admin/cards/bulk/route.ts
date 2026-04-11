// app/api/admin/cards/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseServer } from '@/lib/supabase'

const MAX_ROWS = 100

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes }
    else if (char === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += char }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? '').trim()]))
  })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const fileName = file.name.toLowerCase()

  // Reject xlsx — no parser installed
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return NextResponse.json({
      error: 'Excel 파일은 지원하지 않습니다. CSV로 변환 후 업로드해 주세요.',
      note: 'xlsx 지원은 추가 패키지가 필요합니다.',
    }, { status: 415 })
  }

  if (!fileName.endsWith('.csv')) {
    return NextResponse.json({ error: '.csv 파일만 지원합니다' }, { status: 415 })
  }

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'CSV가 비어 있거나 데이터 행이 없습니다' }, { status: 400 })
  }

  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `최대 ${MAX_ROWS}행까지 업로드할 수 있습니다` }, { status: 400 })
  }

  const duplicate = (formData.get('duplicate') as string) || 'skip'
  const supabase = getSupabaseServer()

  let created = 0
  let updated = 0
  let skipped = 0
  const errors: { row: number; reason: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2 // +2: 1-based index + skip header

    if (!row.slug || !row.name) {
      errors.push({ row: rowNumber, reason: 'slug와 name은 필수 항목입니다' })
      continue
    }

    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      errors.push({ row: rowNumber, reason: `slug "${row.slug}"는 영문 소문자, 숫자, 하이픈만 가능합니다` })
      continue
    }

    const cardData = {
      slug: row.slug,
      name: row.name,
      title: row.title || null,
      company: row.company || null,
      phone: row.phone || null,
      email: row.email || null,
      address: row.address || null,
      website: row.website || null,
      bio: row.bio || null,
      theme_color: row.theme_color || '#2563eb',
    }

    if (duplicate === 'overwrite') {
      const { error } = await supabase.from('cards').upsert(cardData, { onConflict: 'slug' })
      if (error) {
        errors.push({ row: rowNumber, reason: error.message })
      } else {
        updated++
      }
    } else {
      // 'skip': insert and ignore on conflict
      const { error } = await supabase
        .from('cards')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(cardData as any, { onConflict: 'slug', ignoreDuplicates: true } as any)
      if (error) {
        // Postgres unique violation code
        if (error.code === '23505') {
          skipped++
        } else {
          errors.push({ row: rowNumber, reason: error.message })
        }
      } else {
        created++
      }
    }
  }

  return NextResponse.json({ created, updated, skipped, errors })
}
