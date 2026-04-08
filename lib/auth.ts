// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import { getEnv } from '@/lib/env'

const COOKIE_NAME = 'admin_session'
const EXPIRY = '8h'

function getSecret() {
  return new TextEncoder().encode(getEnv('JWT_SECRET')!)
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(EXPIRY)
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export { COOKIE_NAME }
