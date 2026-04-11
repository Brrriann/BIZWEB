'use client'
// Dynamic imports with ssr:false must live in a Client Component
import dynamic from 'next/dynamic'
import { Component, type ReactNode, type ErrorInfo } from 'react'

// Error boundary to prevent a single component crash from breaking the whole page
class SafeBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CardComponent error]', error, info)
  }
  render() { return this.state.hasError ? null : this.props.children }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withSafeBoundary(Comp: React.ComponentType<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function Wrapped(props: any) {
    return <SafeBoundary><Comp {...props} /></SafeBoundary>
  }
}

export const Gallery = dynamic(() => import('./Gallery').then(m => m.Gallery), { ssr: false })
export const CardWithLang = dynamic(() => import('./CardWithLang').then(m => m.CardWithLang), { ssr: false })
export const IntroAnimation = dynamic(
  () => import('./IntroAnimation').then(m => ({ default: withSafeBoundary(m.IntroAnimation) })),
  { ssr: false }
)
