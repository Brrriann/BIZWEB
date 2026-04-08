// components/card/SocialLinks.tsx
import { MessageCircle, Camera, Play, BookOpen, Globe, AtSign, Music, Link, ChevronRight } from 'lucide-react'
import type { SocialLink } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

const PLATFORM_META: Record<string, { icon: LucideIcon; label: string }> = {
  kakao:     { icon: MessageCircle, label: '카카오톡' },
  instagram: { icon: Camera,        label: '인스타그램' },
  youtube:   { icon: Play,          label: '유튜브' },
  naver:     { icon: BookOpen,      label: '네이버 블로그' },
  facebook:  { icon: Globe,         label: '페이스북' },
  twitter:   { icon: AtSign,        label: 'X(트위터)' },
  tiktok:    { icon: Music,         label: '틱톡' },
  website:   { icon: Globe,         label: '홈페이지' },
  link:      { icon: Link,          label: '링크' },
}

interface Props {
  links: SocialLink[]
  sectionTitle?: string
}

export function SocialLinks({ links, sectionTitle }: Props) {
  if (!links.length) return null
  return (
    <div className="px-4 pb-5">
      <h2
        className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
      >
        {sectionTitle || 'Our Service'}
      </h2>
      <div className="flex flex-col gap-2">
        {links.map(link => {
          const meta = PLATFORM_META[link.platform] ?? PLATFORM_META.link
          const Icon = meta.icon
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
              <div className="w-8 flex justify-center" style={{ color: 'var(--text-muted)' }}>
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{link.label || meta.label}</span>
              <ChevronRight size={16} strokeWidth={1.5} className="ml-auto" style={{ color: 'var(--accent)' }} />
            </a>
          )
        })}
      </div>
    </div>
  )
}
