'use client'
// components/card/CardWithLang.tsx
import { useState, useEffect } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { HeroSection } from './HeroSection'
import { ContactInfo } from './ContactInfo'
import type { Card } from '@/lib/types'

interface Props {
  card: Card
}

export function CardWithLang({ card }: Props) {
  const supported = card.supported_languages?.length ? card.supported_languages : ['ko']
  const [lang, setLang] = useState('ko')

  // Resolve preferred language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred_lang')
    if (saved && supported.includes(saved)) {
      setLang(saved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Build a merged card with translations applied (fall back to Korean originals)
  const translation = lang !== 'ko' ? (card.translations?.[lang] ?? {}) : {}

  const mergedCard: Card = {
    ...card,
    name: translation.name || card.name,
    title: translation.title || card.title,
    bio: translation.bio || card.bio,
    address: translation.address || card.address,
  }

  return (
    <div className="relative">
      <LanguageSwitcher
        supported={supported}
        current={lang}
        onChange={setLang}
      />
      <HeroSection
        name={mergedCard.name}
        title={mergedCard.title}
        company={mergedCard.company}
        profileImageUrl={mergedCard.profile_image_url}
        themeColor={mergedCard.theme_color}
      />
      <ContactInfo card={mergedCard} />
    </div>
  )
}
