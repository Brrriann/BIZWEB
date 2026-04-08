// app/[slug]/page.tsx
export const runtime = 'edge'
export const dynamicParams = true

import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase'
import { HeroSection } from '@/components/card/HeroSection'
import { ActionBarWrapper } from '@/components/card/ActionBarWrapper'
import { SocialLinks } from '@/components/card/SocialLinks'
import { ContactInfo } from '@/components/card/ContactInfo'
import { Gallery } from '@/components/card/Gallery'
import { ViewCounter } from '@/components/card/ViewCounter'
import { ThemeToggle } from '@/components/card/ThemeToggle'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

async function getCardData(slug: string) {
  const supabase = getSupabaseServer()
  const { data: card } = await supabase
    .from('cards').select('*').eq('slug', slug).eq('is_active', true).single()
  if (!card) return null

  const [{ data: socialLinks }, { data: galleryImages }, { count }] = await Promise.all([
    supabase.from('social_links').select('*').eq('card_id', card.id).order('sort_order'),
    supabase.from('gallery_images').select('*').eq('card_id', card.id).order('sort_order'),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('card_id', card.id),
  ])

  return { card, socialLinks: socialLinks ?? [], galleryImages: galleryImages ?? [], viewCount: count ?? 0 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getCardData(slug)
  if (!data) return { title: '페이지를 찾을 수 없습니다' }
  return {
    title: `${data.card.name} | 마이네임이즈`,
    description: data.card.bio ?? `${data.card.name}의 디지털 명함`,
  }
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params
  const data = await getCardData(slug)
  if (!data) notFound()

  const { card, socialLinks, galleryImages, viewCount } = data
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`

  return (
    <main
      className="min-h-screen max-w-md mx-auto relative"
      style={{ backgroundColor: 'var(--bg-base)', transition: 'background-color 0.3s ease' }}
    >
      <ThemeToggle />
      <HeroSection
        name={card.name} title={card.title} company={card.company}
        profileImageUrl={card.profile_image_url} themeColor={card.theme_color}
      />
      <ActionBarWrapper card={card} pageUrl={pageUrl} />
      <ContactInfo card={card} />
      <Gallery images={galleryImages} />
      <SocialLinks links={socialLinks} sectionTitle={card.social_links_title} />
      <ViewCounter cardId={card.id} initialCount={viewCount} />
      <footer className="text-center pb-10 pt-2 flex flex-col items-center gap-3">
        <Link
          href="/contact"
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
      </footer>
    </main>
  )
}
