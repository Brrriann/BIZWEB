// components/card/ActionBarWrapper.tsx
'use client'
import { useState } from 'react'
import { ActionBar } from './ActionBar'
import { QRModal } from './QRModal'
import type { Card } from '@/lib/types'

interface Props { card: Card; pageUrl: string; lang?: string }

export function ActionBarWrapper({ card, pageUrl, lang }: Props) {
  const [showQR, setShowQR] = useState(false)
  return (
    <>
      <ActionBar card={card} onQR={() => setShowQR(true)} pageUrl={pageUrl} lang={lang} />
      {showQR && <QRModal url={pageUrl} onClose={() => setShowQR(false)} />}
    </>
  )
}
