'use client'
// components/card/CardWithLang.tsx
import { useState, useEffect } from 'react'
import { FloatingControls } from './FloatingControls'
import { HeroSection } from './HeroSection'
import { ContactInfo } from './ContactInfo'
import { ActionBarWrapper } from './ActionBarWrapper'
import type { Card } from '@/lib/types'

interface Props {
  card: Card
  pageUrl: string
}

export function CardWithLang({ card, pageUrl }: Props) {
  const supported = card.supported_languages?.length ? card.supported_languages : ['ko']
  const [lang, setLang] = useState('ko')

  useEffect(() => {
    const saved = localStorage.getItem('preferred_lang')
    if (saved && supported.includes(saved)) setLang(saved)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const translation = lang !== 'ko' ? (card.translations?.[lang] ?? {}) : {}

  const mergedCard: Card = {
    ...card,
    name: translation.name || card.name,
    title: translation.title || card.title,
    company: translation.company || card.company,
    bio: translation.bio || card.bio,
    address: translation.address || card.address,
  }

  return (
    <div className="relative">
      <FloatingControls supported={supported} currentLang={lang} onLangChange={setLang} />
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
    </div>
  )
}
