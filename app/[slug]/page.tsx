// app/[slug]/page.tsx
export const runtime = 'edge'
export const dynamicParams = true

import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase'
import { ViewCounter } from '@/components/card/ViewCounter'
import { CardWithLang, IntroAnimation } from '@/components/card/CardDynamicComponents'
import { IntroErrorBoundary } from '@/components/card/IntroErrorBoundary'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

async function getCardData(slug: string) {
  const supabase = getSupabaseServer()
  const { data: card } = await supabase
    .from('cards').select('*').eq('slug', slug).eq('is_active', true).single()
  if (!card) return null

  const [{ data: socialLinks }, { data: galleryImages }] = await Promise.all([
    supabase.from('social_links').select('*').eq('card_id', card.id).order('sort_order'),
    supabase.from('gallery_images').select('*').eq('card_id', card.id).order('sort_order'),
  ])

  return { card, socialLinks: socialLinks ?? [], galleryImages: galleryImages ?? [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getCardData(slug)
  if (!data) return { title: '페이지를 찾을 수 없습니다' }
  const { card } = data
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`
  return {
    title: `${card.name} | 마이네임이즈`,
    description: card.bio ?? `${card.name}${card.company ? ` · ${card.company}` : ''}의 디지털 명함`,
    openGraph: {
      title: card.name,
      description: card.bio ?? `${card.name}${card.company ? ` · ${card.company}` : ''}의 디지털 명함`,
      url: pageUrl,
      siteName: 'MY NAME IS.',
      type: 'profile',
      images: [{ url: 'https://mynameis.work/og.png', width: 1200, height: 630, alt: card.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: card.name,
      description: card.bio ?? `${card.name}의 디지털 명함`,
      images: ['https://mynameis.work/og.png'],
    },
  }
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params
  const data = await getCardData(slug)
  if (!data) notFound()

  const { card, socialLinks, galleryImages } = data
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`

  return (
    <main
      className="min-h-screen max-w-md mx-auto relative"
      style={{ backgroundColor: 'var(--bg-base)', transition: 'background-color 0.3s ease' }}
    >
      {card.intro_animation && (
        <IntroErrorBoundary>
          <IntroAnimation
            preset={String(card.intro_animation)}
            cardName={String(card.name ?? '')}
            themeColor={String(card.theme_color ?? '#2563eb')}
            slug={String(card.slug)}
            introText={card.intro_animation_text ? String(card.intro_animation_text) : undefined}
          />
        </IntroErrorBoundary>
      )}
      <CardWithLang
        card={card}
        pageUrl={pageUrl}
        socialLinks={socialLinks}
        galleryImages={galleryImages}
      />
      <ViewCounter />
      <footer className="text-center pb-10 pt-2 flex flex-col items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <span style={{ color: 'var(--accent)' }}>✦</span> MY NAME IS 제작문의
        </Link>
        <Link
          href="/privacy"
          className="text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          개인정보처리방침
        </Link>
        <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          © {new Date().getFullYear()} Magnate Korea. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
