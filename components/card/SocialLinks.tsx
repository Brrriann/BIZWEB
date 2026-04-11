'use client'
import { useState } from 'react'
import { MessageCircle, Camera, Play, BookOpen, Globe, AtSign, Music, Link, ChevronRight } from 'lucide-react'
import type { SocialLink } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

const PLATFORM_META: Record<string, { icon: LucideIcon; ko: string; en: string; ja: string; zh: string }> = {
  kakao:     { icon: MessageCircle, ko: '카카오톡',    en: 'KakaoTalk',     ja: 'カカオトーク',    zh: 'KakaoTalk' },
  instagram: { icon: Camera,        ko: '인스타그램',  en: 'Instagram',     ja: 'Instagram',       zh: 'Instagram' },
  youtube:   { icon: Play,          ko: '유튜브',      en: 'YouTube',       ja: 'YouTube',         zh: 'YouTube' },
  naver:     { icon: BookOpen,      ko: '네이버 블로그', en: 'Naver Blog',  ja: 'Naverブログ',     zh: 'Naver博客' },
  facebook:  { icon: Globe,         ko: '페이스북',    en: 'Facebook',      ja: 'Facebook',        zh: 'Facebook' },
  twitter:   { icon: AtSign,        ko: 'X(트위터)',   en: 'X (Twitter)',   ja: 'X（ツイッター）', zh: 'X（推特）' },
  tiktok:    { icon: Music,         ko: '틱톡',        en: 'TikTok',        ja: 'TikTok',          zh: 'TikTok' },
  website:   { icon: Globe,         ko: '홈페이지',    en: 'Website',       ja: 'ウェブサイト',    zh: '网站' },
  link:      { icon: Link,          ko: '링크',        en: 'Link',          ja: 'リンク',          zh: '链接' },
}

// Korean label → other language translation map
// If the admin wrote a label in Korean, translate it when viewing in another language
const KO_LABEL_MAP: Record<string, { en: string; ja: string; zh: string }> = {
  '카카오톡':     { en: 'KakaoTalk',   ja: 'カカオトーク',    zh: 'KakaoTalk' },
  '인스타그램':  { en: 'Instagram',   ja: 'Instagram',       zh: 'Instagram' },
  '유튜브':      { en: 'YouTube',     ja: 'YouTube',         zh: 'YouTube' },
  '네이버 블로그':{ en: 'Naver Blog', ja: 'Naverブログ',     zh: 'Naver博客' },
  '페이스북':    { en: 'Facebook',    ja: 'Facebook',        zh: 'Facebook' },
  'X(트위터)':   { en: 'X (Twitter)', ja: 'X（ツイッター）', zh: 'X（推特）' },
  '틱톡':        { en: 'TikTok',      ja: 'TikTok',          zh: 'TikTok' },
  '홈페이지':    { en: 'Website',     ja: 'ウェブサイト',    zh: '网站' },
  '링크':        { en: 'Link',        ja: 'リンク',          zh: '链接' },
  '이메일':      { en: 'Email',       ja: 'メール',          zh: '邮箱' },
  '블로그':      { en: 'Blog',        ja: 'ブログ',          zh: '博客' },
  '포트폴리오':  { en: 'Portfolio',   ja: 'ポートフォリオ',  zh: '作品集' },
  '연락처':      { en: 'Contact',     ja: '連絡先',          zh: '联系方式' },
  '쇼핑몰':      { en: 'Shop',        ja: 'ショップ',        zh: '商店' },
}

function translateLabel(label: string, lang: string): string {
  if (lang === 'ko' || !label) return label
  const t = KO_LABEL_MAP[label]
  if (t) return t[lang as keyof typeof t] ?? label
  return label // non-Korean labels stay as-is
}

interface Props {
  links: SocialLink[]
  sectionTitle?: string
  lang?: string
}

function createRipple(e: React.MouseEvent<HTMLAnchorElement>) {
  const button = e.currentTarget
  const ripple = document.createElement('span')
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  ripple.style.cssText = `
    position: absolute; width: ${size}px; height: ${size}px;
    left: ${e.clientX - rect.left - size / 2}px;
    top: ${e.clientY - rect.top - size / 2}px;
    border-radius: 50%; pointer-events: none;
    background: rgba(255,255,255,0.2);
    animation: ripple 0.6s ease-out forwards;
  `
  button.style.position = 'relative'
  button.style.overflow = 'hidden'
  button.appendChild(ripple)
  setTimeout(() => ripple.remove(), 600)
}

function LinkItem({ link, lang = 'ko' }: { link: SocialLink; lang?: string }) {
  const [hovered, setHovered] = useState(false)
  const meta = PLATFORM_META[link.platform] ?? PLATFORM_META.link
  const Icon = meta.icon
  const href = link.url && !link.url.match(/^https?:\/\//) ? `https://${link.url}` : link.url

  // Determine display label:
  // 1. If link has a custom label, translate it if it's Korean
  // 2. Otherwise fall back to platform meta label in current language
  const rawLabel = link.label || meta.ko
  const displayLabel = translateLabel(rawLabel, lang)
    || (meta[lang as keyof typeof meta] as string | undefined)
    || meta.en

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3.5 rounded-xl"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        transition: 'all 0.3s ease',
        boxShadow: hovered
          ? '0 0 20px rgba(30, 215, 96, 0.15), 0 4px 12px rgba(0,0,0,0.15)'
          : '0 0 0 0 transparent',
        transform: hovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={createRipple}
    >
      <div className="w-8 flex justify-center" style={{ color: 'var(--text-muted)' }}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{displayLabel}</span>
      <ChevronRight size={16} strokeWidth={1.5} className="ml-auto" style={{ color: 'var(--accent)' }} />
    </a>
  )
}

export function SocialLinks({ links, sectionTitle, lang = 'ko' }: Props) {
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
        {links.map(link => (
          <LinkItem key={link.id} link={link} lang={lang} />
        ))}
      </div>
    </div>
  )
}
