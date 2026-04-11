// lib/types.ts

export interface CardTranslation {
  name?: string
  title?: string
  bio?: string
  address?: string
}

export interface Card {
  id: string
  slug: string
  name: string
  title?: string
  company?: string
  phone?: string
  email?: string
  address?: string
  website?: string
  bio?: string
  profile_image_url?: string
  theme_color: string
  social_links_title?: string
  is_active: boolean
  // v2 fields
  supported_languages: string[]
  translations: Record<string, CardTranslation>
  status: 'online' | 'vacation'
  status_pin?: string
  intro_animation?: string
  show_qr_card_cta: boolean
}

export interface SocialLink {
  id: string
  card_id: string
  platform: string
  url: string
  label?: string
  sort_order: number
}

export interface GalleryImage {
  id: string
  card_id: string
  image_url: string
  caption?: string
  sort_order: number
}
