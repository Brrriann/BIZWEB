// components/admin/GalleryEditor.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@/lib/types'

const MAX_FILE_SIZE = 500 * 1024 // 500KB
const MAX_DIMENSION = 1920

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // GIF는 압축하지 않음
    if (file.type === 'image/gif') {
      if (file.size <= MAX_FILE_SIZE) return resolve(file)
      return reject(new Error('GIF 파일은 500KB 이하만 업로드 가능합니다'))
    }
    // 이미 500KB 이하면 그대로
    if (file.size <= MAX_FILE_SIZE) return resolve(file)

    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // quality를 낮춰가며 500KB 이하가 될 때까지 압축
      let quality = 0.8
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('이미지 압축 실패'))
            if (blob.size <= MAX_FILE_SIZE || quality <= 0.1) {
              resolve(new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' }))
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          'image/webp',
          quality,
        )
      }
      tryCompress()
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 로드 실패')) }
    img.src = url
  })
}

interface Props { cardId: string; images: GalleryImage[]; onUpdate: () => void }

export function GalleryEditor({ cardId, images, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(data.error || '업로드 실패')
      await fetch(`/api/admin/cards/${cardId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: data.url, sort_order: images.length }),
      })
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
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
