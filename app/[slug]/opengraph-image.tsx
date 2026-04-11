export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = '디지털 명함'

import { ImageResponse } from 'next/og'
import { getSupabaseServer } from '@/lib/supabase'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = getSupabaseServer()
  const { data: card } = await supabase
    .from('cards')
    .select('name, title, company, theme_color, profile_image_url, bio')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  const name        = String(card?.name ?? 'MY NAME IS')
  const title       = String(card?.title ?? '')
  const company     = String(card?.company ?? '')
  const accent      = String(card?.theme_color ?? '#1ed760')
  const profileUrl  = card?.profile_image_url ? String(card.profile_image_url) : null
  const initial     = name.charAt(0).toUpperCase()

  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        fontFamily: '"Inter", "Noto Sans KR", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: -120, left: -80,
          width: 700, height: 700, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}25 0%, transparent 65%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}15 0%, transparent 65%)`,
        }} />

        {/* Left accent bar */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 6, background: accent,
        }} />

        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 64, padding: '0 96px 0 80px', width: '100%' }}>

          {/* Avatar */}
          <div style={{ flexShrink: 0, display: 'flex' }}>
            {profileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileUrl}
                width={200} height={200}
                style={{ borderRadius: '50%', border: `5px solid ${accent}`, objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 200, height: 200, borderRadius: '50%',
                background: `${accent}20`,
                border: `5px solid ${accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 88, fontWeight: 800, color: accent,
              }}>
                {initial}
              </div>
            )}
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 72, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              {name}
            </div>
            {title && (
              <div style={{ fontSize: 32, color: '#888888', fontWeight: 400 }}>
                {title}
              </div>
            )}
            {company && (
              <div style={{ fontSize: 34, fontWeight: 700, color: accent }}>
                {company}
              </div>
            )}

            {/* Divider */}
            <div style={{ width: 60, height: 3, background: accent, borderRadius: 2, marginTop: 8 }} />
          </div>
        </div>

        {/* Bottom branding */}
        <div style={{
          position: 'absolute', bottom: 36, right: 56,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: accent,
          }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: '#333', letterSpacing: '-0.02em' }}>
            MY NAME IS<span style={{ color: accent }}>.</span>
          </div>
        </div>

      </div>
    ),
    { ...size }
  )
}
