// app/api/cards/[slug]/status/route.ts
// PUBLIC API — no admin auth required. Uses service role key (getSupabaseServer),
// so no additional RLS policy is needed for this update.
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

// SHA-256 hash using Web Crypto API (Edge Runtime compatible — bcrypt is NOT available)
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { pin, status } = await req.json()

  const validStatuses = ['online', 'busy', 'meeting', 'offline']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 })
  }

  const supabase = getSupabaseServer()
  const { data: card } = await supabase
    .from('cards')
    .select('id, status_pin')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) return NextResponse.json({ error: '카드를 찾을 수 없습니다' }, { status: 404 })

  // If a PIN hash is stored, verify the supplied PIN
  if (card.status_pin) {
    if (!pin) return NextResponse.json({ error: 'PIN이 필요합니다' }, { status: 401 })
    const pinHash = await sha256(pin)
    if (pinHash !== card.status_pin) {
      return NextResponse.json({ error: 'PIN이 올바르지 않습니다' }, { status: 401 })
    }
  }

  await supabase
    .from('cards')
    .update({ status })
    .eq('id', card.id)

  return NextResponse.json({ status })
}
