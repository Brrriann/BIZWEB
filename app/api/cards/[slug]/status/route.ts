// app/api/cards/[slug]/status/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Constant-time comparison to prevent timing attacks on hash comparison
function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Rate limit: max 10 PIN attempts per slug per 10 minutes
const pinAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_PIN_ATTEMPTS = 10
const PIN_WINDOW_MS = 10 * 60 * 1000

function checkPinRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = pinAttempts.get(key)
  if (!entry || now > entry.resetAt) {
    pinAttempts.set(key, { count: 1, resetAt: now + PIN_WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_PIN_ATTEMPTS) return false
  entry.count++
  return true
}

function clearPinRateLimit(key: string) {
  pinAttempts.delete(key)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const ip = req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'
  const rateLimitKey = `${slug}:${ip}`

  if (!checkPinRateLimit(rateLimitKey)) {
    return NextResponse.json(
      { error: '너무 많은 시도. 잠시 후 다시 시도하세요.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  const body = await req.json().catch(() => ({}))
  const { pin, status } = body

  const validStatuses = ['online', 'vacation']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 })
  }

  if (!pin) return NextResponse.json({ error: 'PIN이 필요합니다' }, { status: 401 })

  const supabase = getSupabaseServer()
  const { data: card } = await supabase
    .from('cards')
    .select('id, status_pin')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) return NextResponse.json({ error: '카드를 찾을 수 없습니다' }, { status: 404 })

  if (!card.status_pin) {
    return NextResponse.json({ error: '관리자가 PIN을 설정하지 않았습니다' }, { status: 403 })
  }

  const pinHash = await sha256(String(pin))
  if (!timingSafeHexEqual(pinHash, String(card.status_pin))) {
    return NextResponse.json({ error: 'PIN이 올바르지 않습니다' }, { status: 401 })
  }

  clearPinRateLimit(rateLimitKey)

  await supabase.from('cards').update({ status }).eq('id', card.id)
  return NextResponse.json({ status })
}
