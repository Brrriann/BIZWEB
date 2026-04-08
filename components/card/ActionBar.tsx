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

  const actions = [
    card.phone && { icon: '📞', label: '전화', href: `tel:${card.phone}` },
    card.phone && { icon: '💬', label: '문자', href: `sms:${card.phone}` },
    { icon: '💾', label: '저장', onClick: downloadVCF },
    { icon: '📱', label: 'QR', onClick: onQR },
  ].filter(Boolean) as { icon: string; label: string; href?: string; onClick?: () => void }[]

  return (
    <div className="px-4 pb-5 flex gap-2">
      {actions.map(action => {
        const className = "flex flex-col items-center gap-1.5 flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
        const style = {
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border)',
          letterSpacing: '0.05em',
        }

        if (action.href) {
          return (
            <a key={action.label} href={action.href} className={className} style={style}>
              <span className="text-lg">{action.icon}</span>{action.label}
            </a>
          )
        }
        return (
          <button key={action.label} onClick={action.onClick} className={className} style={style}>
            <span className="text-lg">{action.icon}</span>{action.label}
          </button>
        )
      })}
    </div>
  )
}
