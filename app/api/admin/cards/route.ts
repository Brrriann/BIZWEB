// app/api/admin/cards/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.name || !body.slug) return NextResponse.json({ error: 'name, slug required' }, { status: 400 })
  if (!/^[a-z0-9-]+$/.test(body.slug)) {
    return NextResponse.json({ error: 'slug는 영문 소문자, 숫자, 하이픈만 가능' }, { status: 400 })
  }
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('cards').insert({
    slug: body.slug, name: body.name, title: body.title, company: body.company,
    phone: body.phone, email: body.email, address: body.address,
    website: body.website, bio: body.bio,
    profile_image_url: body.profile_image_url,
    theme_color: body.theme_color ?? '#2563eb',
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
