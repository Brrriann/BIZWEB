// components/card/ContactInfo.tsx
import type { Card } from '@/lib/types'

interface Props { card: Card }

export function ContactInfo({ card }: Props) {
  const items = [
    card.phone   && { icon: '📞', label: '전화', value: card.phone,   href: `tel:${card.phone}` },
    card.email   && { icon: '✉️', label: '이메일', value: card.email,  href: `mailto:${card.email}` },
    card.address && { icon: '📍', label: '주소',   value: card.address, href: `https://map.naver.com/search?query=${encodeURIComponent(card.address)}` },
    card.website && { icon: '🌐', label: '홈페이지', value: card.website, href: card.website },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string }[]

  if (!items.length && !card.bio) return null

  return (
    <div className="px-4 pb-4">
      {card.bio && (
        <div className="mb-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 leading-relaxed">{card.bio}</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {items.map(item => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl w-8 text-center">{item.icon}</span>
            <div>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm text-gray-700 font-medium">{item.value}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
