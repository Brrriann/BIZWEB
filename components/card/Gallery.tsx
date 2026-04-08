// components/card/Gallery.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@/lib/types'

interface Props { images: GalleryImage[] }

export function Gallery({ images }: Props) {
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  if (!images.length) return null

  return (
    <div className="px-4 pb-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">갤러리</h2>
      <div className="grid grid-cols-3 gap-1">
        {images.map(img => (
          <button key={img.id} onClick={() => setSelected(img)} className="aspect-square overflow-hidden rounded-lg">
            <Image src={img.image_url} alt={img.caption ?? ''} width={200} height={200}
              className="object-cover w-full h-full hover:opacity-90 transition-opacity" />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <Image src={selected.image_url} alt={selected.caption ?? ''} width={500} height={500}
              className="rounded-xl object-contain w-full" />
            {selected.caption && (
              <p className="text-white text-center mt-2 text-sm">{selected.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
