'use client'
// components/card/ContactInfo.tsx
import { Phone, PhoneCall, Printer, Mail, MapPin } from 'lucide-react'
import type { Card, ExtraContact } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

const FIELD_LABELS: Record<string, Record<string, string>> = {
  ko: { phone: '전화', email: '이메일', address: '주소', mobile: '휴대폰', office: '일반전화', fax: '팩스' },
  en: { phone: 'Phone', email: 'Email', address: 'Address', mobile: 'Mobile', office: 'Office', fax: 'Fax' },
  ja: { phone: '電話', email: 'メール', address: '住所', mobile: '携帯', office: '代表電話', fax: 'FAX' },
  zh: { phone: '电话', email: '邮箱', address: '地址', mobile: '手机', office: '座机', fax: '传真' },
}

const TYPE_ICON: Record<string, LucideIcon> = {
  phone: Phone, mobile: Phone, office: PhoneCall, fax: Printer, email: Mail, address: MapPin,
}

interface ContactRowProps {
  icon: LucideIcon
  label: string
  value: string
  href: string
  external?: boolean
}

function ContactRow({ icon: Icon, label, value, href, external }: ContactRowProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="w-8 flex justify-center" style={{ color: 'var(--text-muted)' }}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </a>
  )
}

interface Props { card: Card; lang?: string }

export function ContactInfo({ card, lang = 'ko' }: Props) {
  const t = FIELD_LABELS[lang] ?? FIELD_LABELS.ko

  const primary = [
    card.phone   && { icon: Phone,  label: t.phone,   value: card.phone,   href: `tel:${card.phone}` },
    card.email   && { icon: Mail,   label: t.email,   value: card.email,   href: `mailto:${card.email}` },
    card.address && { icon: MapPin, label: t.address, value: card.address, href: `https://map.naver.com/search?query=${encodeURIComponent(card.address)}`, external: true },
  ].filter(Boolean) as ContactRowProps[]

  const extra = (card.extra_contacts ?? []).map((c: ExtraContact) => {
    const Icon = TYPE_ICON[c.type] ?? Phone
    const rawLabel = c.label || t[c.type] || c.type
    // Sanitize href — only allow safe schemes per type
    let href = '#'
    if (c.type === 'email') {
      const safe = c.value.replace(/[^a-zA-Z0-9@._%+\-]/g, '')
      href = `mailto:${safe}`
    } else if (c.type === 'address') {
      href = `https://map.naver.com/search?query=${encodeURIComponent(c.value)}`
    } else {
      // phone/mobile/office/fax — digits and hyphens only
      const safe = c.value.replace(/[^0-9\-+]/g, '')
      href = `tel:${safe}`
    }
    return { icon: Icon, label: rawLabel, value: c.value, href, external: c.type === 'address' }
  })

  const allItems = [...primary, ...extra]
  if (!allItems.length && !card.bio) return null

  return (
    <div className="px-4 pb-5">
      {card.bio && (
        <div className="mb-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{card.bio}</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {allItems.map((item, i) => <ContactRow key={i} {...item} />)}
      </div>
    </div>
  )
}
