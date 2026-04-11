// app/api/revalidate/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getEnv } from '@/lib/env'

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const VALID_SLUG = /^[a-z0-9-]+$/

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret') ?? ''
  const expected = getEnv('REVALIDATE_SECRET') ?? ''

  if (!timingSafeEqual(secret, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { slug } = body
  if (!slug || !VALID_SLUG.test(slug)) {
    return NextResponse.json({ error: 'invalid slug' }, { status: 400 })
  }

  revalidatePath(`/${slug}`)
  return NextResponse.json({ revalidated: true })
}
