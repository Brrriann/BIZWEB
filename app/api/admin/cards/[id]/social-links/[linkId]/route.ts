// app/api/admin/cards/[id]/social-links/[linkId]/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { linkId } = await params
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('social_links').delete().eq('id', linkId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
