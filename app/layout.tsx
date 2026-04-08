import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '마이네임이즈',
  description: '모바일 디지털 명함 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
