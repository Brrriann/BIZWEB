// components/card/ViewCounter.tsx
'use client'
import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

interface Props { cardId: string; initialCount: number }

export function ViewCounter({ cardId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    })
      .then(r => r.json())
      .then(d => { if (typeof d.count === 'number') setCount(d.count) })
      .catch(() => {})
  }, [cardId])

  return (
    <div className="px-4 pb-6 text-center">
      <p className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
        <Eye size={14} strokeWidth={1.5} />
        {count.toLocaleString()}명이 방문했습니다
      </p>
    </div>
  )
}
