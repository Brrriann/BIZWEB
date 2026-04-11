export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MY NAME IS — 디지털 명함 서비스'

import { ImageResponse } from 'next/og'

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: -60, left: '5%',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,215,96,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: '5%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,215,96,0.07) 0%, transparent 70%)',
        }} />

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Logo */}
          <div style={{
            fontSize: 80, fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.04em', lineHeight: 1,
            display: 'flex', alignItems: 'flex-end',
          }}>
            MY NAME IS<span style={{ color: '#1ed760' }}>.</span>
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 28, color: '#666666', fontWeight: 400, letterSpacing: '-0.01em' }}>
            나만의 디지털 명함 — 링크 하나로 모든 것을
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {['다국어 지원', '실시간 상태', 'QR · NFC 명함', '맞춤 인트로'].map(f => (
              <div key={f} style={{
                padding: '10px 20px',
                borderRadius: 999,
                background: 'rgba(30,215,96,0.1)',
                border: '1px solid rgba(30,215,96,0.25)',
                fontSize: 18, fontWeight: 600, color: '#1ed760',
              }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div style={{
          position: 'absolute', bottom: 36, right: 52,
          fontSize: 18, color: '#333', fontWeight: 600,
        }}>
          mynameis.work
        </div>
      </div>
    ),
    { ...size }
  )
}
