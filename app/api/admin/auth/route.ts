// app/api/admin/auth/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }
  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8시간
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
