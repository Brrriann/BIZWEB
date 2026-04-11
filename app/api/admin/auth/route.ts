// app/api/admin/auth/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, COOKIE_NAME } from '@/lib/auth'
import { getEnv } from '@/lib/env'

// Constant-time string comparison to prevent timing attacks
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const aBytes = enc.encode(a)
  const bBytes = enc.encode(b)
  // Pad to equal length to avoid length-based timing leaks
  const len = Math.max(aBytes.length, bBytes.length)
  const aPad = new Uint8Array(len)
  const bPad = new Uint8Array(len)
  aPad.set(aBytes)
  bPad.set(bBytes)
  // XOR all bytes — if any differ, result is non-zero
  let diff = 0
  for (let i = 0; i < len; i++) diff |= aPad[i] ^ bPad[i]
  return diff === 0 && aBytes.length === bBytes.length
}

// Simple in-memory rate limiting per IP (resets on worker restart)
// For production, use Cloudflare KV or Durable Objects
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

function clearRateLimit(ip: string) {
  attempts.delete(ip)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: '너무 많은 시도. 15분 후 다시 시도하세요.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    )
  }

  const body = await req.json().catch(() => ({}))
  const { pin } = body
  const adminPin = getEnv('ADMIN_PIN') ?? ''

  if (!pin || !(await timingSafeEqual(String(pin), adminPin))) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  clearRateLimit(ip)
  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return res
}

export async function DELETE(req: NextRequest) {
  // Only allow if user has a valid session cookie (prevent CSRF logout)
  const session = req.cookies.get(COOKIE_NAME)
  if (!session?.value) return NextResponse.json({ ok: true })
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
