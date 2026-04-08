// components/card/SocialLinks.tsx
import type { SocialLink } from '@/lib/types'

const PLATFORM_ICONS: Record<string, { icon: string; label: string }> = {
  kakao:     { icon: '💬', label: '카카오톡' },
  instagram: { icon: '📷', label: '인스타그램' },
  youtube:   { icon: '▶️', label: '유튜브' },
  naver:     { icon: '🟢', label: '네이버 블로그' },
  facebook:  { icon: '🔵', label: '페이스북' },
  twitter:   { icon: '🐦', label: 'X(트위터)' },
  tiktok:    { icon: '🎵', label: '틱톡' },
  link:      { icon: '🔗', label: '링크' },
}

interface Props { links: SocialLink[]; themeColor?: string }

export function SocialLinks({ links }: Props) {
  if (!links.length) return null
  return (
    <div className="px-4 pb-5">
      <h2
        className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
      >
        소셜 미디어
      </h2>
      <div className="flex flex-col gap-2">
        {links.map(link => {
          const meta = PLATFORM_ICONS[link.platform] ?? PLATFORM_ICONS.link
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="text-xl w-8 text-center">{meta.icon}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{meta.label}</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--accent)' }}>→</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
