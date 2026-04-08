// components/card/ThemeToggle.tsx
'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border)',
      }}
      aria-label="테마 전환"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
