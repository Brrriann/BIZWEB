// app/api/admin/cards/[id]/gallery/[imgId]/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ imgId: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { imgId } = await params
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('gallery_images').delete().eq('id', imgId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
