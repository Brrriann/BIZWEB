// components/card/ActionBarWrapper.tsx
'use client'
import { useState } from 'react'
import { ActionBar } from './ActionBar'
import { QRModal } from './QRModal'
import type { Card } from '@/lib/types'

export function ActionBarWrapper({ card, pageUrl }: { card: Card; pageUrl: string }) {
  const [showQR, setShowQR] = useState(false)
  return (
    <>
      <ActionBar card={card} onQR={() => setShowQR(true)} pageUrl={pageUrl} />
      {showQR && <QRModal url={pageUrl} onClose={() => setShowQR(false)} />}
    </>
  )
}
