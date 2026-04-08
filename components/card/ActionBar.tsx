// components/card/ActionBar.tsx
'use client'
import { generateVCF } from '@/lib/vcf'
import type { Card } from '@/lib/types'

interface Props { card: Card; onQR: () => void }

export function ActionBar({ card, onQR }: Props) {
  function downloadVCF() {
    const vcf = generateVCF({
      name: card.name, phone: card.phone, email: card.email,
      company: card.company, title: card.title,
      address: card.address, website: card.website,
    })
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${card.name}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const btnClass = "flex flex-col items-center gap-1 flex-1 py-3 rounded-xl text-white text-xs font-medium transition-opacity hover:opacity-90 active:opacity-80"

  return (
    <div className="px-4 pb-4 flex gap-2">
      {card.phone && (
        <a href={`tel:${card.phone}`} className={btnClass} style={{ backgroundColor: card.theme_color }}>
          <span className="text-lg">📞</span>전화
        </a>
      )}
      {card.phone && (
        <a href={`sms:${card.phone}`} className={btnClass} style={{ backgroundColor: card.theme_color }}>
          <span className="text-lg">💬</span>문자
        </a>
      )}
      <button onClick={downloadVCF} className={btnClass} style={{ backgroundColor: card.theme_color }}>
        <span className="text-lg">💾</span>저장
      </button>
      <button onClick={onQR} className={btnClass} style={{ backgroundColor: card.theme_color }}>
        <span className="text-lg">📱</span>QR
      </button>
    </div>
  )
}
