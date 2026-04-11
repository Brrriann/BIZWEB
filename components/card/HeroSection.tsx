// components/card/HeroSection.tsx
'use client'
import { useRef } from 'react'
import { User } from 'lucide-react'
import { InlineStatusBadge } from './InlineStatusBadge'

interface Props {
  name: string
  title?: string
  company?: string
  profileImageUrl?: string
  themeColor: string
  status?: unknown
  slug?: string
  hasPIN?: boolean
}

export function HeroSection({ name, title, company, profileImageUrl, themeColor, status, slug, hasPIN }: Props) {
  const imgRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = imgRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(400px) rotateX(${-y * 15}deg) rotateY(${x * 15}deg) scale(1.05)`
  }

  function handleMouseLeave() {
    const el = imgRef.current
    if (!el) return
    el.style.transform = 'perspective(400px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  return (
    <div className="relative">
      <div
        className="h-36 w-full"
        style={{ background: `linear-gradient(180deg, ${themeColor ?? '#2563eb'} 0%, var(--bg-base) 100%)` }}
      />
      <div className="px-5 pb-5">
        <div className="flex items-end gap-4 -mt-10">
          <div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0"
            style={{
              border: '4px solid var(--bg-surface)',
              boxShadow: 'var(--shadow-elevated)',
              backgroundColor: 'var(--bg-elevated)',
              transition: 'transform 0.3s ease',
            }}
          >
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImageUrl} alt={name} width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                <User size={36} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{name}</h1>
              {slug && status != null && (
                <InlineStatusBadge
                  slug={slug}
                  initialStatus={status}
                  hasPIN={!!hasPIN}
                />
              )}
            </div>
            {title && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{title}</p>}
            {company && <p className="text-sm font-semibold" style={{ color: themeColor ?? '#2563eb' }}>{company}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
