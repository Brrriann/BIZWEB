// components/card/ViewCounter.tsx
'use client'
import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

// Base: 372 users at 2026-04-11 14:00 KST (UTC+9 → UTC 05:00)
const BASE_COUNT = 372
const BASE_TIME = new Date('2026-04-11T05:00:00Z').getTime()

function getUserCount(): number {
  const hoursElapsed = Math.floor((Date.now() - BASE_TIME) / (1000 * 60 * 60))
  return BASE_COUNT + Math.max(0, hoursElapsed)
}

export function ViewCounter() {
  const [count, setCount] = useState(getUserCount)

  // Update every hour on the hour
  useEffect(() => {
    const msUntilNextHour = 3600000 - (Date.now() % 3600000)
    const timeout = setTimeout(() => {
      setCount(getUserCount())
      const interval = setInterval(() => setCount(getUserCount()), 3600000)
      return () => clearInterval(interval)
    }, msUntilNextHour)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="px-4 pb-6 text-center">
      <p className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
        <Users size={14} strokeWidth={1.5} />
        MY NAME IS 사용자 {count.toLocaleString()}명
      </p>
    </div>
  )
}
