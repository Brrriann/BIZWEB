// app/api/views/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { shouldCountView, hashIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { cardId } = body
  if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 })

  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '0.0.0.0'
  const supabase = getSupabaseServer()
  const shouldCount = await shouldCountView(supabase, cardId, ip)

  if (shouldCount) {
    const ipHash = await hashIP(ip)
    await supabase.from('page_views').insert({ card_id: cardId, ip_hash: ipHash })
  }

  const { count } = await supabase
    .from('page_views').select('*', { count: 'exact', head: true }).eq('card_id', cardId)

  return NextResponse.json({ count: count ?? 0 })
}
