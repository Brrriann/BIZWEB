// components/admin/GalleryEditor.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@/lib/types'

interface Props { cardId: string; images: GalleryImage[]; onUpdate: () => void }

export function GalleryEditor({ cardId, images, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const { url } = await uploadRes.json()
    await fetch(`/api/admin/cards/${cardId}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, sort_order: images.length }),
    })
    onUpdate()
    setUploading(false)
    e.target.value = ''
  }

  async function removeImage(imgId: string) {
    await fetch(`/api/admin/cards/${cardId}/gallery/${imgId}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">갤러리</label>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {images.map(img => (
          <div key={img.id} className="relative aspect-square">
            <Image src={img.image_url} alt="" fill className="object-cover rounded-lg" />
            <button type="button" onClick={() => removeImage(img.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
          </div>
        ))}
      </div>
      <label className={`inline-block cursor-pointer border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-blue-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {uploading ? '업로드 중...' : '+ 이미지 추가'}
        <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className="hidden" />
      </label>
    </div>
  )
}
