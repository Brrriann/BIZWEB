// app/api/admin/cards/[id]/social-links/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseServer()
  const { data } = await supabase.from('social_links').select('*').eq('card_id', id).order('sort_order')
  return NextResponse.json(data ?? [])
}

const ALLOWED_PLATFORMS = new Set([
  'kakao','instagram','youtube','naver','facebook','twitter','tiktok','website','link'
])

function isSafeUrl(raw: string): boolean {
  if (!raw) return false
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch { return false }
}

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { platform, url, label, sort_order } = body

  if (!ALLOWED_PLATFORMS.has(platform)) {
    return NextResponse.json({ error: '허용되지 않는 플랫폼입니다' }, { status: 400 })
  }
  if (!isSafeUrl(url)) {
    return NextResponse.json({ error: '유효하지 않은 URL입니다 (http/https만 허용)' }, { status: 400 })
  }

  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('social_links')
    .insert({ card_id: id, platform, url, label: label || null, sort_order: sort_order ?? 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
