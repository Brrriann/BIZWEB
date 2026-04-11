'use client'
// components/card/CardWithLang.tsx
import { useState } from 'react'
import { FloatingControls } from './FloatingControls'
import { HeroSection } from './HeroSection'
import { ContactInfo } from './ContactInfo'
import { ActionBarWrapper } from './ActionBarWrapper'
import { SocialLinks } from './SocialLinks'
import dynamic from 'next/dynamic'
import type { Card, SocialLink, GalleryImage } from '@/lib/types'

const Gallery = dynamic(() => import('./Gallery').then(m => m.Gallery), { ssr: false })

interface Props {
  card: Card
  pageUrl: string
  socialLinks: SocialLink[]
  galleryImages: GalleryImage[]
}

function getSavedLang(supported: string[]): string {
  try {
    const saved = localStorage.getItem('preferred_lang')
    if (saved && supported.includes(saved)) return saved
  } catch {}
  return 'ko'
}

export function CardWithLang({ card, pageUrl, socialLinks, galleryImages }: Props) {
  const supported = card.supported_languages?.length ? card.supported_languages : ['ko']

  // Lazy initializer reads localStorage immediately — no flash on refresh
  const [lang, setLang] = useState<string>(() => getSavedLang(supported))

  const translation = lang !== 'ko' ? (card.translations?.[lang] ?? {}) : {}

  const mergedCard: Card = {
    ...card,
    name: translation.name || card.name,
    title: translation.title || card.title,
    company: translation.company || card.company,
    bio: translation.bio || card.bio,
    address: translation.address || card.address,
  }

  function handleLangChange(l: string) {
    try { localStorage.setItem('preferred_lang', l) } catch {}
    setLang(l)
  }

  return (
    <div className="relative">
      <FloatingControls supported={supported} currentLang={lang} onLangChange={handleLangChange} />
      <HeroSection
        name={mergedCard.name}
        title={mergedCard.title}
        company={mergedCard.company}
        profileImageUrl={mergedCard.profile_image_url}
        themeColor={mergedCard.theme_color}
        status={mergedCard.status}
        slug={mergedCard.slug}
        hasPIN={!!mergedCard.status_pin}
      />
      <ContactInfo card={mergedCard} lang={lang} />
      <ActionBarWrapper card={mergedCard} pageUrl={pageUrl} lang={lang} />
      <Gallery images={galleryImages} />
      <SocialLinks links={socialLinks} sectionTitle={mergedCard.social_links_title} lang={lang} />
    </div>
  )
}
