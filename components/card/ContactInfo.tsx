// components/card/ContactInfo.tsx
import { Phone, Mail, MapPin } from 'lucide-react'
import type { Card } from '@/lib/types'

const LABELS: Record<string, { phone: string; email: string; address: string }> = {
  ko: { phone: '전화',  email: '이메일', address: '주소' },
  en: { phone: 'Phone', email: 'Email',  address: 'Address' },
  ja: { phone: '電話',  email: 'メール', address: '住所' },
}

interface Props { card: Card; lang?: string }

export function ContactInfo({ card, lang = 'ko' }: Props) {
  const t = LABELS[lang] ?? LABELS.ko
  const items = [
    card.phone   && { icon: Phone,  label: t.phone,   value: card.phone,   href: `tel:${card.phone}` },
    card.email   && { icon: Mail,   label: t.email,   value: card.email,   href: `mailto:${card.email}` },
    card.address && { icon: MapPin, label: t.address, value: card.address, href: `https://map.naver.com/search?query=${encodeURIComponent(card.address)}` },
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
