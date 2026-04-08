// components/admin/SocialLinksEditor.tsx
'use client'
import { useState } from 'react'
import type { SocialLink } from '@/lib/types'

const PLATFORMS = ['kakao','instagram','youtube','naver','facebook','twitter','tiktok','link']

interface Props {
  cardId: string
  links: SocialLink[]
  onUpdate: () => void
}

export function SocialLinksEditor({ cardId, links, onUpdate }: Props) {
  const [platform, setPlatform] = useState('kakao')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function addLink(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    await fetch(`/api/admin/cards/${cardId}/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, url, sort_order: links.length }),
    })
    setUrl('')
    onUpdate()
    setLoading(false)
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
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>SNS 링크</label>
      <div className="flex flex-col gap-2 mb-3">
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>[{link.platform}] {link.url}</span>
            <button type="button" onClick={() => removeLink(link.id)}
              className="text-xs font-semibold" style={{ color: '#f3727f' }}>삭제</button>
          </div>
        ))}
      </div>
      <form onSubmit={addLink} className="flex gap-2">
        <select value={platform} onChange={e => setPlatform(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm" style={inputStyle}>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL 입력"
          className="rounded-xl px-3 py-2 text-sm flex-1" style={inputStyle} />
        <button type="submit" disabled={loading}
          className="rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}>추가</button>
      </form>
    </div>
  )
}
