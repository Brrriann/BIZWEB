// app/api/revalidate/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getEnv } from '@/lib/env'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== getEnv('REVALIDATE_SECRET')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  revalidatePath(`/${slug}`)
  return NextResponse.json({ revalidated: true, slug })
}
