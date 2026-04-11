'use client'
import { useEffect, useState, useCallback } from 'react'

interface Props {
  preset: string
  cardName: string
  themeColor: string
  slug: string
  introText?: string  // custom text overrides defaults
}

interface Particle {
  id: number
  angle: number
  distance: number
  size: number
  delay: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + (i * 7) % 18,
    distance: 80 + (i * 13) % 120,
    size: 4 + (i * 3) % 8,
    delay: (i * 0.015),
  }))
}

const PARTICLES = generateParticles(20)

const KEYFRAMES = `
@keyframes intro-fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes intro-overlay-fadeout {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes intro-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0%); }
}
@keyframes intro-slide-down {
  from { transform: translateY(0%); }
  to   { transform: translateY(100%); }
}
@keyframes intro-particle-fly {
  0%   { opacity: 1; transform: translate(0, 0) scale(1); }
  80%  { opacity: 0.6; }
  100% { opacity: 0; }
}
@keyframes intro-ring-pulse {
  0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}
@keyframes intro-cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
`

export function IntroAnimation({ preset, cardName, themeColor, introText }: Props) {
  const displayText = introText?.trim() || (preset === 'typewriter' ? cardName : 'MY NAME IS.')
  const [played, setPlayed] = useState(false)
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [typedText, setTypedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [slidePhase, setSlidePhase] = useState<'up' | 'down'>('up')

  const dismiss = useCallback(() => {
    setPhase('out')
    setTimeout(() => setPlayed(true), 500)
  }, [])

  useEffect(() => {
    if (played) return

    if (preset === 'typewriter') {
      let i = 0
      const interval = setInterval(() => {
        i++
        setTypedText(displayText.slice(0, i))
        if (i >= displayText.length) {
          clearInterval(interval)
          setTypingDone(true)
          setTimeout(dismiss, 500)
        }
      }, 80)
      return () => clearInterval(interval)
    }

    if (preset === 'slide') {
      // Panel slides up (covers screen) then slides down (reveals card)
      const timer1 = setTimeout(() => setSlidePhase('down'), 600)
      const timer2 = setTimeout(dismiss, 1200)
      return () => { clearTimeout(timer1); clearTimeout(timer2) }
    }

    if (preset === 'fade') {
      const timer = setTimeout(dismiss, 1500)
      return () => clearTimeout(timer)
    }

    if (preset === 'particles') {
      const timer = setTimeout(dismiss, 1500)
      return () => clearTimeout(timer)
    }

    if (preset === 'wave') {
      const timer = setTimeout(dismiss, 2000)
      return () => clearTimeout(timer)
    }
  }, [played, preset, cardName, dismiss])

  // Don't render anything if animation was already played or completed
  if (played) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.45s ease',
    opacity: phase === 'out' ? 0 : 1,
    pointerEvents: phase === 'out' ? 'none' : 'auto',
  }

  // ----- FADE preset -----
  if (preset === 'fade') {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div style={{ ...overlayStyle, backgroundColor: '#000' }} onClick={dismiss}>
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(1.2rem, 6vw, 2rem)',
            letterSpacing: '0.15em',
            color: '#fff',
            textTransform: 'uppercase',
            animation: 'intro-fade-in 0.8s ease forwards',
          }}>
            {displayText}
          </span>
        </div>
      </>
    )
  }

  // ----- SLIDE preset -----
  if (preset === 'slide') {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: themeColor,
            animation: slidePhase === 'up'
              ? 'intro-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards'
              : 'intro-slide-down 0.55s cubic-bezier(0.64,0,0.78,0) forwards',
            pointerEvents: phase === 'out' ? 'none' : 'auto',
            cursor: 'pointer',
          }}
          onClick={dismiss}
        />
      </>
    )
  }

  // ----- TYPEWRITER preset -----
  if (preset === 'typewriter') {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div style={{ ...overlayStyle, backgroundColor: '#111' }} onClick={dismiss}>
          <span style={{
            fontFamily: 'Inter, monospace',
            fontWeight: 700,
            fontSize: 'clamp(1.4rem, 7vw, 2.5rem)',
            color: '#fff',
            letterSpacing: '0.05em',
          }}>
            {typedText}
            {!typingDone && (
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '1.1em',
                backgroundColor: themeColor,
                marginLeft: 3,
                verticalAlign: 'text-bottom',
                animation: 'intro-cursor-blink 0.7s step-end infinite',
              }} />
            )}
          </span>
        </div>
      </>
    )
  }

  // ----- PARTICLES preset -----
  if (preset === 'particles') {
    const particleKeyframes = PARTICLES.map(p => {
      const rad = (p.angle * Math.PI) / 180
      const tx = Math.cos(rad) * p.distance
      const ty = Math.sin(rad) * p.distance
      return `
        @keyframes particle-fly-${p.id} {
          0%   { opacity: 1; transform: translate(0, 0) scale(1); }
          80%  { opacity: 0.6; transform: translate(${tx * 0.9}px, ${ty * 0.9}px) scale(0.8); }
          100% { opacity: 0; transform: translate(${tx}px, ${ty}px) scale(0.3); }
        }
      `
    }).join('\n')

    return (
      <>
        <style>{KEYFRAMES + particleKeyframes}</style>
        <div style={{ ...overlayStyle, backgroundColor: '#0a0a0a' }} onClick={dismiss}>
          <div style={{ position: 'relative', width: 0, height: 0 }}>
            {PARTICLES.map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: themeColor,
                  top: -p.size / 2,
                  left: -p.size / 2,
                  animation: `particle-fly-${p.id} 1.2s cubic-bezier(0.22,1,0.36,1) ${p.delay}s forwards`,
                }}
              />
            ))}
            {/* Center dot */}
            <div style={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: themeColor,
              top: -6,
              left: -6,
              animation: 'intro-fade-in 0.3s ease forwards',
            }} />
          </div>
        </div>
      </>
    )
  }

  // ----- WAVE preset -----
  if (preset === 'wave') {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div style={{ ...overlayStyle, backgroundColor: '#0a0a0a' }} onClick={dismiss}>
          <div style={{ position: 'relative', width: 0, height: 0 }}>
            {[0, 0.4, 0.8].map((delay, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: `3px solid ${themeColor}`,
                  animation: `intro-ring-pulse 1.6s cubic-bezier(0,0,0.2,1) ${delay}s infinite`,
                }}
              />
            ))}
            {/* Center filled circle */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: themeColor,
              transform: 'translate(-50%, -50%)',
            }} />
          </div>
        </div>
      </>
    )
  }

  return null
}
