'use client'
// Dynamic imports with ssr:false must live in a Client Component
import dynamic from 'next/dynamic'

export const Gallery = dynamic(() => import('./Gallery').then(m => m.Gallery), { ssr: false })
export const StatusBadge = dynamic(() => import('./StatusBadge').then(m => m.StatusBadge), { ssr: false })
export const CardWithLang = dynamic(() => import('./CardWithLang').then(m => m.CardWithLang), { ssr: false })
export const IntroAnimation = dynamic(() => import('./IntroAnimation').then(m => m.IntroAnimation), { ssr: false })
