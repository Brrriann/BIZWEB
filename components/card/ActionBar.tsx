// components/card/ActionBar.tsx
'use client'
import { useState } from 'react'
import { Phone, MessageSquare, Download, QrCode, Link, Share2 } from 'lucide-react'
import { generateVCF } from '@/lib/vcf'
import type { Card } from '@/lib/types'

const LABELS: Record<string, Record<string, string>> = {
  ko: { call: '전화', sms: '문자', save: '연락처저장', qr: 'QR', copy: '링크복사', copied: '복사됨!', share: '공유', shared: '공유됨!' },
  en: { call: 'Call', sms: 'Text', save: 'Save', qr: 'QR', copy: 'Copy Link', copied: 'Copied!', share: 'Share', shared: 'Shared!' },
  ja: { call: '電話', sms: 'SMS', save: '連絡先保存', qr: 'QR', copy: 'リンクコピー', copied: 'コピー済!', share: 'シェア', shared: 'シェア済!' },
}

interface Props { card: Card; onQR: () => void; pageUrl: string; lang?: string }

export function ActionBar({ card, onQR, pageUrl, lang = 'ko' }: Props) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const t = LABELS[lang] ?? LABELS.ko

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

  async function copyLink() {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareCard() {
    if (navigator.share) {
      await navigator.share({ title: card.name, url: pageUrl })
    } else {
      await navigator.clipboard.writeText(pageUrl)
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const actions = [
    card.phone && { icon: Phone, label: t.call, href: `tel:${card.phone}` },
    card.phone && { icon: MessageSquare, label: t.sms, href: `sms:${card.phone}` },
    { icon: Download, label: t.save, onClick: downloadVCF },
    { icon: QrCode, label: t.qr, onClick: onQR },
    { icon: Link, label: copied ? t.copied : t.copy, onClick: copyLink },
    { icon: Share2, label: shared ? t.shared : t.share, onClick: shareCard },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href?: string; onClick?: () => void }[]

  return (
    <div className="px-4 pb-5 grid grid-cols-3 gap-2">
      {actions.map(action => {
        const Icon = action.icon
        const className = "flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
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
              <Icon size={20} strokeWidth={1.5} />{action.label}
            </a>
          )
        }
        return (
          <button key={action.label} onClick={action.onClick} className={className} style={style}>
            <Icon size={20} strokeWidth={1.5} />{action.label}
          </button>
        )
      })}
    </div>
  )
}
