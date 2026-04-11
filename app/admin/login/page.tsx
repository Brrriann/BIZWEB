// app/admin/login/page.tsx
'use client'
export const runtime = 'edge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('PIN이 올바르지 않습니다')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div
        className="p-8 rounded-2xl w-full max-w-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--border)',
        }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>관리자 로그인</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>마이네임이즈 관리자 전용</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="PIN 입력"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          />
          {error && <p className="text-sm" style={{ color: '#f3727f' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000',
              letterSpacing: '0.1em',
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </main>
  )
}
