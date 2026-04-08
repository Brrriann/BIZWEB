'use client'
export const runtime = 'edge'
// app/admin/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Card } from '@/lib/types'

export default function AdminPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [newName, setNewName] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/cards').then(r => r.json()).then(setCards)
  }, [])

  async function createCard(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newSlug, name: newName }),
    })
    const card = await res.json()
    if (res.ok) router.push(`/admin/${card.id}`)
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">고객 명함 목록</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowNew(true)}
            className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-700">
            + 새 명함
          </button>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">로그아웃</button>
        </div>
      </div>

      {showNew && (
        <form onSubmit={createCard} className="bg-gray-50 rounded-2xl p-4 mb-4 flex gap-3">
          <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase())}
            placeholder="slug (영문)" required
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="이름" required
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm">생성</button>
          <button type="button" onClick={() => setShowNew(false)} className="text-gray-400 text-sm px-2">취소</button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {cards.map(card => (
          <div key={card.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow transition-shadow">
            <div>
              <p className="font-semibold text-gray-900">{card.name}</p>
              <p className="text-sm text-gray-400">/{card.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${card.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {card.is_active ? '활성' : '비활성'}
              </span>
              <a href={`/${card.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-600">보기</a>
              <button onClick={() => router.push(`/admin/${card.id}`)} className="text-sm text-blue-600 font-medium hover:underline">편집</button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-gray-400 text-sm text-center py-8">아직 명함이 없습니다</p>}
      </div>
    </div>
  )
}
