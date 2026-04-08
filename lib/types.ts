// lib/types.ts
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
  is_active: boolean
}

export interface SocialLink {
  id: string
  card_id: string
  platform: string
  url: string
  sort_order: number
}

export interface GalleryImage {
  id: string
  card_id: string
  image_url: string
  caption?: string
  sort_order: number
}
