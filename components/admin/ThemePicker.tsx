// components/admin/ThemePicker.tsx
'use client'
import { useState } from 'react'

const PRESETS = ['#1ed760','#2563eb','#dc2626','#9333ea','#ea580c','#0891b2']

interface Props { value: string; onChange: (v: string) => void }

export function ThemePicker({ value, onChange }: Props) {
  const [custom, setCustom] = useState(
    PRESETS.includes(value) ? '' : value
  )

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>테마 색상</label>
      <div className="flex gap-2 flex-wrap items-center">
        {PRESETS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => { onChange(color); setCustom('') }}
            className="w-9 h-9 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: color,
              boxShadow: value === color ? `0 0 0 3px var(--bg-base), 0 0 0 5px ${color}` : 'none',
            }}
          />
        ))}
        <div className="flex items-center gap-1 ml-2">
          <input
            type="color"
            value={custom || value}
            onChange={e => { setCustom(e.target.value); onChange(e.target.value) }}
            className="w-9 h-9 rounded-full cursor-pointer border-0 p-0"
            title="커스텀 색상"
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>커스텀</span>
        </div>
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>현재: {value}</p>
    </div>
  )
}
