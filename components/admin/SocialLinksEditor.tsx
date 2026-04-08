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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">SNS 링크</label>
      <div className="flex flex-col gap-2 mb-3">
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-700">[{link.platform}] {link.url}</span>
            <button type="button" onClick={() => removeLink(link.id)} className="text-red-400 text-xs hover:text-red-600">삭제</button>
          </div>
        ))}
      </div>
      <form onSubmit={addLink} className="flex gap-2">
        <select value={platform} onChange={e => setPlatform(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL 입력"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1" />
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm disabled:opacity-50">추가</button>
      </form>
    </div>
  )
}
