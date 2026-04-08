// lib/env.ts
import { getRequestContext } from '@cloudflare/next-on-pages'

export function getEnv(key: string): string | undefined {
  try {
    const { env } = getRequestContext()
    return (env as Record<string, string>)[key]
  } catch {
    // Fallback for build-time or non-edge contexts
    return process.env[key]
  }
}
