// app/api/admin/upload/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: '허용되지 않는 파일 형식' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: '파일 크기는 5MB 이하' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = await file.arrayBuffer()

  const supabase = getSupabaseServer()
  const { error } = await supabase.storage.from('card-images').upload(fileName, buffer, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(fileName)
  return NextResponse.json({ url: publicUrl })
}
