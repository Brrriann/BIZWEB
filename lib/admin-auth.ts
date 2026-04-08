// lib/admin-auth.ts
import { NextRequest } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from './auth'

export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}
