'use client'
import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Languages } from 'lucide-react'

const LANG_FLAGS: Record<string, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
}

interface Props {
  supported: string[]
  currentLang: string
  onLangChange: (lang: string) => void
}

export function FloatingControls({ supported, currentLang, onLangChange }: Props) {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [open])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  function handleLang(lang: string) {
    localStorage.setItem('preferred_lang', lang)
    onLangChange(lang)
    setOpen(false)
  }

  const btnStyle = {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-card)',
  }

  const showLangs = supported.length > 1

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-50 flex flex-col items-center gap-2">
      {/* Expanded options — shown above the trigger going upward, or below */}
      {open && (
        <div className="flex flex-col items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={btnStyle}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>

          {/* Language buttons */}
          {showLangs && supported.map(lang => (
            <button
              key={lang}
              onClick={() => handleLang(lang)}
              className="w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                ...btnStyle,
                backgroundColor: currentLang === lang ? 'var(--accent)' : 'var(--bg-elevated)',
                color: currentLang === lang ? '#000' : 'var(--text-primary)',
              }}
              aria-label={lang}
            >
              {LANG_FLAGS[lang] ?? lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          ...btnStyle,
          backgroundColor: open ? 'var(--accent)' : 'var(--bg-elevated)',
          color: open ? '#000' : 'var(--text-primary)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease, background-color 0.2s ease',
        }}
        aria-label="설정"
      >
        <Languages size={18} strokeWidth={1.5} />
      </button>
    </div>
  )
}
