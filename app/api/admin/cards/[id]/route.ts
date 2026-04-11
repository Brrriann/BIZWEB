// app/api/admin/cards/[id]/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('cards').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const supabase = getSupabaseServer()
  const patch: Record<string, unknown> = {
    name: body.name, title: body.title, company: body.company,
    phone: body.phone, email: body.email, address: body.address,
    website: body.website, bio: body.bio,
    profile_image_url: body.profile_image_url,
    theme_color: body.theme_color, is_active: body.is_active,
    // v2 fields
    supported_languages: body.supported_languages,
    translations: body.translations,
    status: body.status,
    intro_animation: body.intro_animation ?? null,
    intro_animation_text: body.intro_animation_text ?? null,
    show_qr_card_cta: body.show_qr_card_cta,
    social_links_title: body.social_links_title,
    extra_contacts: body.extra_contacts ?? [],
  }
  if (body.status_pin !== undefined) patch.status_pin = body.status_pin
  const { data, error } = await supabase.from('cards').update(patch).eq('id', id).select().single()
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 500 })
  revalidatePath(`/${data.slug}`)
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
