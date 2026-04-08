// app/api/debug-env/route.ts — 임시 디버그용, 확인 후 삭제
export const runtime = 'edge'

import { NextResponse } from 'next/server'

export async function GET() {
  let ctxEnv: Record<string, string> = {}
  let ctxError = ''

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    const { env } = getRequestContext()
    ctxEnv = Object.fromEntries(
      Object.entries(env as Record<string, unknown>).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.slice(0, 6) + '...' : typeof v,
      ])
    )
  } catch (e: unknown) {
    ctxError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    processEnv: {
      ADMIN_PIN: process.env.ADMIN_PIN ? 'SET' : 'UNSET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'UNSET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'UNSET',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'UNSET',
    },
    getRequestContext: ctxError || ctxEnv,
  })
}
