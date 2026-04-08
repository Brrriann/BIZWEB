// components/admin/ThemePicker.tsx
'use client'
import { useState } from 'react'

const PRESETS = ['#2563eb','#16a34a','#dc2626','#9333ea','#ea580c','#0891b2']

interface Props { value: string; onChange: (v: string) => void }

export function ThemePicker({ value, onChange }: Props) {
  const [custom, setCustom] = useState(
    PRESETS.includes(value) ? '' : value
  )

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">테마 색상</label>
      <div className="flex gap-2 flex-wrap items-center">
        {PRESETS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => { onChange(color); setCustom('') }}
            className={`w-8 h-8 rounded-full transition-transform ${value === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
            style={{ backgroundColor: color }}
          />
        ))}
        <div className="flex items-center gap-1 ml-2">
          <input
            type="color"
            value={custom || value}
            onChange={e => { setCustom(e.target.value); onChange(e.target.value) }}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            title="커스텀 색상"
          />
          <span className="text-xs text-gray-400">커스텀</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">현재: {value}</p>
    </div>
  )
}
