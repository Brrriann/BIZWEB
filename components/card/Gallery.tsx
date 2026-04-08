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
    <div className="px-4 pb-5">
      <h2
        className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
      >
        갤러리
      </h2>
      <div className="grid grid-cols-3 gap-1.5">
        {images.map(img => (
          <button
            key={img.id}
            onClick={() => setSelected(img)}
            className="aspect-square overflow-hidden rounded-lg transition-all duration-200 hover:opacity-80 hover:scale-[1.03]"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <Image src={img.image_url} alt={img.caption ?? ''} width={200} height={200}
              className="object-cover w-full h-full" />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={() => setSelected(null)}
        >
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <Image src={selected.image_url} alt={selected.caption ?? ''} width={500} height={500}
              className="rounded-xl object-contain w-full" style={{ boxShadow: 'var(--shadow-elevated)' }} />
            {selected.caption && (
              <p className="text-center mt-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {selected.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
