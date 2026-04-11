import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = 'https://mynameis.work'

export const metadata: Metadata = {
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  title: 'MY NAME IS. — 디지털 명함',
  description: '링크 하나로 전달하는 나만의 디지털 명함. 다국어 지원, 실시간 상태, QR·NFC 실물 카드 제작.',
  openGraph: {
    title: 'MY NAME IS.',
    description: '링크 하나로 전달하는 나만의 디지털 명함',
    siteName: 'MY NAME IS.',
    type: 'website',
    images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630, alt: 'MY NAME IS.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MY NAME IS.',
    description: '링크 하나로 전달하는 나만의 디지털 명함',
    images: [`${BASE_URL}/og.png`],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
