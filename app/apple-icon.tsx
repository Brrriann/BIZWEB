import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0a0a0a',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Card shape */}
        <div style={{
          width: 120,
          height: 80,
          background: '#141414',
          borderRadius: 14,
          border: '3px solid #222',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '10px 14px',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1ed760', flexShrink: 0 }} />
            <div style={{ height: 8, flex: 1, background: '#fff', borderRadius: 4, opacity: 0.85 }} />
          </div>
          <div style={{ height: 6, width: '65%', background: '#333', borderRadius: 3 }} />
          <div style={{ height: 5, width: '45%', background: '#2a2a2a', borderRadius: 3 }} />
        </div>
        {/* Green dot accent */}
        <div style={{
          position: 'absolute',
          bottom: 22,
          right: 22,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#1ed760',
        }} />
      </div>
    ),
    { ...size }
  )
}
