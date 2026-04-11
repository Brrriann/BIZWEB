'use client'
import { Component, type ReactNode, type ErrorInfo } from 'react'

interface State { hasError: boolean }

export class IntroErrorBoundary extends Component<{ children: ReactNode }, State> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e: Error, info: ErrorInfo) {
    console.error('[IntroAnimation error]', e.message, info.componentStack)
  }
  render() { return this.state.hasError ? null : this.props.children }
}
