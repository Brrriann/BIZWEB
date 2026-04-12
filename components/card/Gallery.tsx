// components/card/Gallery.tsx
'use client'
import { useState, useRef } from 'react'
import type { GalleryImage } from '@/lib/types'

interface Props { images: GalleryImage[] }

export function Gallery({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  if (!images.length) return null

  const total = images.length

  function goNext() {
    setSelectedIndex(prev => prev === null ? null : (prev + 1) % total)
  }

  function goPrev() {
    setSelectedIndex(prev => prev === null ? null : (prev - 1 + total) % total)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext()   // swipe left → next
      else goPrev()          // swipe right → prev
    }
  }

  const selected = selectedIndex !== null ? images[selectedIndex] : null

  return (
    <div className="px-4 pb-5">
      <h2
        className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
      >
        갤러리
      </h2>
      <div className="grid grid-cols-3 gap-1.5">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(idx)}
            className="aspect-square overflow-hidden rounded-lg transition-all duration-200 hover:opacity-80 hover:scale-[1.03]"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <img src={img.image_url} alt={img.caption ?? ''}
              className="object-cover w-full h-full" />
          </button>
        ))}
      </div>

      {selected && selectedIndex !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={() => setSelectedIndex(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-white text-xl font-bold z-10"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={e => { e.stopPropagation(); setSelectedIndex(null) }}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Image counter */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            {selectedIndex + 1} / {total}
          </div>

          {/* Prev arrow */}
          {total > 1 && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white text-lg font-bold z-10"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={e => { e.stopPropagation(); goPrev() }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Next arrow */}
          {total > 1 && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white text-lg font-bold z-10"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={e => { e.stopPropagation(); goNext() }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Image content */}
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img
              src={selected.image_url}
              alt={selected.caption ?? ''}
              className="rounded-xl object-contain w-full"
              style={{ boxShadow: 'var(--shadow-elevated)' }}
            />
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
