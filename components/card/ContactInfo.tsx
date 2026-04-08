// components/card/ContactInfo.tsx
import { Phone, Mail, MapPin } from 'lucide-react'
import type { Card } from '@/lib/types'

interface Props { card: Card }

export function ContactInfo({ card }: Props) {
  const items = [
    card.phone   && { icon: Phone,  label: '전화', value: card.phone,   href: `tel:${card.phone}` },
    card.email   && { icon: Mail,   label: '이메일', value: card.email,  href: `mailto:${card.email}` },
    card.address && { icon: MapPin,  label: '주소',   value: card.address, href: `https://map.naver.com/search?query=${encodeURIComponent(card.address)}` },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href: string }[]

  if (!items.length && !card.bio) return null

  return (
    <div className="px-4 pb-5">
      {card.bio && (
        <div
          className="mb-3 p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{card.bio}</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {items.map(item => {
          const Icon = item.icon
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="w-8 flex justify-center" style={{ color: 'var(--text-muted)' }}>
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
