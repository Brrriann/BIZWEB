// app/admin/[id]/page.tsx
// 주의: 'use client' 전용 페이지이므로 export const runtime = 'edge' 사용 안 함
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CardEditor } from '@/components/admin/CardEditor'
import type { Card, SocialLink, GalleryImage } from '@/lib/types'

export default function EditCardPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<{ card: Card; socialLinks: SocialLink[]; galleryImages: GalleryImage[] } | null>(null)

  const load = useCallback(async () => {
    const [card, links, gallery] = await Promise.all([
      fetch(`/api/admin/cards/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/cards/${id}/social-links`).then(r => r.json()).catch(() => []),
      fetch(`/api/admin/cards/${id}/gallery`).then(r => r.json()).catch(() => []),
    ])
    if (!card) return router.push('/admin')
    setData({ card, socialLinks: links, galleryImages: gallery })
  }, [id, router])

  useEffect(() => { load() }, [load])

  if (!data) return <div className="p-8 text-gray-400">불러오는 중...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600 text-sm">← 목록</button>
        <h1 className="text-xl font-bold text-gray-900">{data.card.name} 편집</h1>
        <a href={`/${data.card.slug}`} target="_blank" rel="noopener noreferrer"
          className="ml-auto text-sm text-blue-600 hover:underline">페이지 보기 →</a>
      </div>
      <CardEditor {...data} onRefresh={load} />
    </div>
  )
}
