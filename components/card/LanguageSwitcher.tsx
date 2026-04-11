'use client'
// components/card/LanguageSwitcher.tsx
import { useState, useEffect } from 'react'

interface Props {
  supported: string[]
  current: string
  onChange: (lang: string) => void
}

const LANG_LABELS: Record<string, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
}

export function LanguageSwitcher({ supported, current, onChange }: Props) {
  const [active, setActive] = useState(current)

  useEffect(() => {
    const saved = localStorage.getItem('preferred_lang')
    if (saved && supported.includes(saved)) {
      setActive(saved)
      onChange(saved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setActive(current)
  }, [current])

  if (supported.length <= 1) return null

  function handleChange(lang: string) {
    setActive(lang)
    localStorage.setItem('preferred_lang', lang)
    onChange(lang)
  }

  return (
    <div
      className="fixed top-4 left-4 flex gap-1 z-50"
      aria-label="언어 선택"
    >
      {supported.map(lang => (
        <button
          key={lang}
          type="button"
          onClick={() => handleChange(lang)}
          className="w-10 h-10 rounded-full text-xl transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: active === lang ? 'var(--accent)' : 'var(--bg-elevated)',
            color: active === lang ? '#000' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {LANG_LABELS[lang] ?? lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
