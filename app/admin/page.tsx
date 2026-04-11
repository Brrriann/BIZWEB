'use client'
export const runtime = 'edge'
// app/admin/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Card } from '@/lib/types'
import BulkImport from '@/components/admin/BulkImport'

export default function AdminPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [showNew, setShowNew] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/cards').then(r => r.json()).then(setCards)
  }, [])

  async function createCard(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newSlug, name: newName }),
    })
    const card = await res.json()
    if (res.ok) {
      router.push(`/admin/${card.id}`)
    } else {
      setError(card.error || '생성 실패')
    }
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>고객 명함 목록</h1>
        <div className="flex gap-2">
          <button onClick={() => { setShowBulk(v => !v); setShowNew(false) }}
            className="rounded-full px-5 py-2 text-sm font-bold transition-all hover:scale-105"
            style={{ backgroundColor: showBulk ? 'var(--bg-elevated)' : 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            일괄 등록
          </button>
          <button onClick={() => { setShowNew(true); setShowBulk(false) }}
            className="rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--accent)', color: '#000', letterSpacing: '0.05em' }}>
            + 새 명함
          </button>
          <button onClick={logout} className="text-sm px-3" style={{ color: 'var(--text-muted)' }}>로그아웃</button>
        </div>
      </div>

      {showBulk && <BulkImport />}

      {showNew && (
        <>
          <form onSubmit={createCard}
            className="rounded-2xl p-4 mb-4 flex gap-3"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="slug (영문, 예: hong-gildong)" required
              className="rounded-full px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2"
              style={inputStyle} />
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="이름" required
              className="rounded-full px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2"
              style={inputStyle} />
            <button type="submit"
              className="rounded-full px-5 py-2 text-sm font-bold"
              style={{ backgroundColor: 'var(--accent)', color: '#000' }}>생성</button>
            <button type="button" onClick={() => setShowNew(false)} className="text-sm px-2" style={{ color: 'var(--text-muted)' }}>취소</button>
          </form>
          {error && <p className="text-sm mb-4 px-1" style={{ color: '#f3727f' }}>{error}</p>}
        </>
      )}

      <div className="flex flex-col gap-2">
        {cards.map(card => (
          <div key={card.id}
            className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all hover:scale-[1.01]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{card.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>/{card.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: card.is_active ? 'rgba(30,215,96,0.15)' : 'var(--bg-elevated)',
                  color: card.is_active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {card.is_active ? '활성' : '비활성'}
              </span>
              <a href={`/${card.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-sm" style={{ color: 'var(--text-muted)' }}>보기</a>
              <button onClick={() => router.push(`/admin/${card.id}`)}
                className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>편집</button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>아직 명함이 없습니다</p>}
      </div>
    </div>
  )
}
