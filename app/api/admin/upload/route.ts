// app/api/admin/upload/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  // Extension is derived from MIME type — never from the user-supplied filename
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) return NextResponse.json({ error: '허용되지 않는 파일 형식' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: '파일 크기는 5MB 이하' }, { status: 400 })

  // Filename is fully server-generated — no user input
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`
  const buffer = await file.arrayBuffer()

  const supabase = getSupabaseServer()
  const { error } = await supabase.storage.from('card-images').upload(fileName, buffer, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(fileName)
  return NextResponse.json({ url: publicUrl })
}
