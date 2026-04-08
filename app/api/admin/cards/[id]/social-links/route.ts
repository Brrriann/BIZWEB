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

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { platform, url, sort_order } = await req.json()
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('social_links')
    .insert({ card_id: id, platform, url, sort_order: sort_order ?? 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
