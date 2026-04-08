// lib/__tests__/auth.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { signAdminToken, verifyAdminToken } from '../auth'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum!!'
})

describe('auth', () => {
  it('토큰 서명 후 검증 성공', async () => {
    const token = await signAdminToken()
    expect(await verifyAdminToken(token)).toBe(true)
  })

  it('잘못된 토큰 검증 실패', async () => {
    expect(await verifyAdminToken('invalid.token.here')).toBe(false)
  })
})
