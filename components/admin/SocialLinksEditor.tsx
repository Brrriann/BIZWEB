// components/admin/SocialLinksEditor.tsx
'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { SocialLink } from '@/lib/types'

const PLATFORMS = ['website','kakao','instagram','youtube','naver','facebook','twitter','tiktok','link']

interface Props {
  cardId: string
  links: SocialLink[]
  onUpdate: () => void
}

export function SocialLinksEditor({ cardId, links, onUpdate }: Props) {
  const [platform, setPlatform] = useState('kakao')
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)

  async function addLink() {
    if (!url) return
    setLoading(true)
    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
    try {
      const res = await fetch(`/api/admin/cards/${cardId}/social-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, url: normalizedUrl, label: label || undefined, sort_order: links.length }),
      })
      if (!res.ok) throw new Error('추가 실패')
      setUrl('')
      setLabel('')
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : '추가 실패')
    } finally {
      setLoading(false)
    }
  }

  async function removeLink(linkId: string) {
    await fetch(`/api/admin/cards/${cardId}/social-links/${linkId}`, { method: 'DELETE' })
    onUpdate()
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>서비스 링크</label>
      <div className="flex flex-col gap-2 mb-3">
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {!link.label && <span style={{ color: 'var(--text-muted)' }}>[{link.platform}] </span>}
              {link.label && <span className="font-semibold">{link.label} · </span>}
              <span style={{ color: 'var(--text-secondary)' }}>{link.url}</span>
            </div>
            <button type="button" onClick={() => removeLink(link.id)}
              className="p-1 rounded-full transition-colors hover:opacity-80 flex-shrink-0 ml-2" style={{ color: '#f3727f' }}>
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {!label && (
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm" style={inputStyle}>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="버튼 이름 (비우면 플랫폼 기본값)"
            className="rounded-xl px-3 py-2 text-sm flex-1"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL 입력"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }}
            className="rounded-xl px-3 py-2 text-sm flex-1"
            style={inputStyle}
          />
          <button type="button" onClick={addLink} disabled={loading}
            className="rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}>추가</button>
        </div>
      </div>
    </div>
  )
}
