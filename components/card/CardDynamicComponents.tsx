'use client'
// Dynamic imports with ssr:false must live in a Client Component
import dynamic from 'next/dynamic'

export const CardWithLang = dynamic(() => import('./CardWithLang').then(m => m.CardWithLang), { ssr: false })
// IntroAnimation renders server-side so the overlay is in the initial HTML (no flash)
export const IntroAnimation = dynamic(() => import('./IntroAnimation').then(m => m.IntroAnimation))
