'use client'
// components/admin/LanguageEditor.tsx
import type { CardTranslation } from '@/lib/types'

interface Props {
  supported: string[]
  translations: Record<string, CardTranslation>
  onChange: (supported: string[], translations: Record<string, CardTranslation>) => void
}

const ALL_LANGS: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
]

const FIELD_LABELS: { key: keyof CardTranslation; label: string }[] = [
  { key: 'name',    label: '이름' },
  { key: 'title',   label: '직함' },
  { key: 'company', label: '회사명' },
  { key: 'bio',     label: '소개글' },
  { key: 'address', label: '주소' },
]

const inputStyle = {
  backgroundColor: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
}

export function LanguageEditor({ supported, translations, onChange }: Props) {
  function toggleLang(code: string, enabled: boolean) {
    let next: string[]
    if (enabled) {
      next = [...supported, code]
    } else {
      next = supported.filter(l => l !== code)
      // Also clear translation when disabled
      const nextTranslations = { ...translations }
      delete nextTranslations[code]
      onChange(next, nextTranslations)
      return
    }
    onChange(next, translations)
  }

  function updateField(langCode: string, field: keyof CardTranslation, value: string) {
    const nextTranslations: Record<string, CardTranslation> = {
      ...translations,
      [langCode]: {
        ...(translations[langCode] ?? {}),
        [field]: value,
      },
    }
    onChange(supported, nextTranslations)
  }

  return (
    <div className="space-y-4">
      {/* Korean is always on */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <input type="checkbox" checked disabled className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
        <span>한국어 (기본값, 항상 활성)</span>
      </div>

      {ALL_LANGS.map(({ code, label }) => {
        const isEnabled = supported.includes(code)
        const t = translations[code] ?? {}
        return (
          <div key={code}>
            {/* Language toggle checkbox */}
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-2" style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={e => toggleLang(code, e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--accent)' }}
              />
              {label}
            </label>

            {/* Translation fields — shown only when enabled */}
            {isEnabled && (
              <div
                className="ml-6 p-3 rounded-xl space-y-2"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                {FIELD_LABELS.map(({ key, label: fieldLabel }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                      {fieldLabel} ({code.toUpperCase()})
                    </label>
                    {key === 'bio' ? (
                      <textarea
                        value={t[key] ?? ''}
                        onChange={e => updateField(code, key, e.target.value)}
                        placeholder="비워두면 한국어 기본값 사용"
                        rows={2}
                        className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1"
                        style={inputStyle}
                      />
                    ) : (
                      <input
                        type="text"
                        value={t[key] ?? ''}
                        onChange={e => updateField(code, key, e.target.value)}
                        placeholder="비워두면 한국어 기본값 사용"
                        className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1"
                        style={inputStyle}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
