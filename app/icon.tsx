import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0a0a0a',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Card shape */}
        <div style={{
          width: 22,
          height: 15,
          background: '#1a1a1a',
          borderRadius: 3,
          border: '1.5px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Green dot + lines mimicking a name card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '2px 3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1ed760', flexShrink: 0 }} />
              <div style={{ height: 2, flex: 1, background: '#fff', borderRadius: 1, opacity: 0.8 }} />
            </div>
            <div style={{ height: 1.5, width: '70%', background: '#444', borderRadius: 1 }} />
          </div>
        </div>
        {/* Green accent dot bottom-right */}
        <div style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#1ed760',
        }} />
      </div>
    ),
    { ...size }
  )
}
