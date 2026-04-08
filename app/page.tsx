'use client'
// app/page.tsx — MY NAME IS Landing Page
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, visible }
}

/* ─── Animated section wrapper ─── */
function Reveal({ children, delay = 0, className = '', style = {} }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.98)',
        filter: visible ? 'blur(0px)' : 'blur(6px)',
        transition: `opacity 0.85s cubic-bezier(0.32,0.72,0,1) ${delay}ms, transform 0.85s cubic-bezier(0.32,0.72,0,1) ${delay}ms, filter 0.85s cubic-bezier(0.32,0.72,0,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Phone Mockup ─── */
function PhoneMockup() {
  return (
    <div style={{ perspective: '900px' }}>
      <div style={{
        width: 220,
        borderRadius: 36,
        background: '#0a0a0a',
        border: '8px solid #1a1a1a',
        boxShadow: '0 0 0 1px #2a2a2a, 0 60px 120px rgba(30,215,96,0.15), 0 0 80px rgba(30,215,96,0.05)',
        overflow: 'hidden',
        transform: 'rotateY(-12deg) rotateX(4deg)',
        transition: 'transform 0.9s cubic-bezier(0.32,0.72,0,1)',
      }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'rotateY(-4deg) rotateX(2deg)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(4deg)')}
      >
        {/* Status bar */}
        <div style={{ background: '#111', padding: '12px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>9:41</span>
          <div style={{ width: 80, height: 18, background: '#000', borderRadius: 12, border: '1px solid #222' }} />
          <span style={{ fontSize: 11, color: '#fff' }}>●●●</span>
        </div>
        {/* Hero strip */}
        <div style={{ height: 72, background: 'linear-gradient(135deg, #1ed760 0%, #0a8f40 100%)' }} />
        {/* Profile */}
        <div style={{ background: '#121212', padding: '0 14px 12px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1ed760', border: '3px solid #121212', marginTop: -26, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22 }}>👤</span>
          </div>
          <div style={{ height: 10, width: 80, background: '#fff', borderRadius: 4, marginBottom: 4 }} />
          <div style={{ height: 7, width: 56, background: '#555', borderRadius: 4 }} />
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {['전화', '문자', '저장', 'QR'].map(l => (
              <div key={l} style={{ flex: 1, background: '#1f1f1f', borderRadius: 24, padding: '7px 2px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
                <div style={{ fontSize: 7, color: '#b3b3b3', fontWeight: 700 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Links */}
          {['홈페이지', '인스타그램', '유튜브'].map(l => (
            <div key={l} style={{ background: '#181818', borderRadius: 10, padding: '8px 10px', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #222' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1ed760' }} />
              <div style={{ height: 6, flex: 1, background: '#333', borderRadius: 3 }} />
              <div style={{ fontSize: 8, color: '#1ed760' }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Bento Card ─── */
function BentoCard({ children, className = '', glowColor = '' }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  return (
    <div className={className} style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 24,
      padding: 1.5,
      boxShadow: glowColor ? `0 0 60px ${glowColor}` : 'none',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 100%)',
        borderRadius: 23,
        padding: '28px 28px',
        height: '100%',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ background: '#050505', minHeight: '100dvh', fontFamily: "'Plus Jakarta Sans', 'Geist', system-ui, sans-serif", color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #1ed76033; }
        .green { color: #1ed760; }
        .pill-tag {
          display: inline-flex; align-items: center;
          background: rgba(30,215,96,0.1); border: 1px solid rgba(30,215,96,0.25);
          color: #1ed760; border-radius: 999px;
          padding: 4px 14px; font-size: 10px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
        }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: #1ed760; color: #000;
          border-radius: 999px; padding: 14px 24px;
          font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
          text-decoration: none; transition: transform 0.4s cubic-bezier(0.32,0.72,0,1), box-shadow 0.4s cubic-bezier(0.32,0.72,0,1);
          border: none; cursor: pointer;
        }
        .cta-btn:hover { transform: scale(1.04); box-shadow: 0 0 40px rgba(30,215,96,0.4); }
        .cta-btn:active { transform: scale(0.97); }
        .cta-icon {
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;
          transition: transform 0.4s cubic-bezier(0.32,0.72,0,1);
          font-size: 14px;
        }
        .cta-btn:hover .cta-icon { transform: translate(2px, -2px) scale(1.1); }
        .ghost-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05); color: #fff;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 999px;
          padding: 13px 24px; font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.4s cubic-bezier(0.32,0.72,0,1);
          cursor: pointer;
        }
        .ghost-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }
        .step-num {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(30,215,96,0.1); border: 1px solid rgba(30,215,96,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #1ed760;
          flex-shrink: 0;
        }
      `}</style>

      {/* ── Floating Nav ── */}
      <nav style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: 'calc(100% - 32px)', maxWidth: 640 }}>
        <div style={{
          background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999,
          padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>
            MY NAME IS<span className="green">.</span>
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/contact" className="cta-btn" style={{ padding: '9px 18px', fontSize: 12 }}>
              제작문의
              <span className="cta-icon" style={{ width: 24, height: 24, fontSize: 12 }}>↗</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Ambient orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,215,96,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,215,96,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', padding: '120px 24px 80px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%' }}
          className="hero-grid">
          <style>{`.hero-grid { grid-template-columns: 1fr 1fr !important; } @media(max-width:768px){ .hero-grid { grid-template-columns: 1fr !important; } .hero-phone { display: none !important; } }`}</style>

          {/* Left */}
          <div>
            <Reveal>
              <div className="pill-tag" style={{ marginBottom: 28 }}>Digital Business Card</div>
            </Reveal>
            <Reveal delay={80}>
              <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 24px' }}>
                당신의 명함을<br />
                <span className="green">스마트하게</span><br />
                디지털로.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: 16, color: '#b3b3b3', lineHeight: 1.7, marginBottom: 36, maxWidth: 420 }}>
                링크 하나로 전화, 문자, 연락처 저장, SNS까지.<br />
                종이 명함이 필요 없는 시대의 디지털 명함.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/contact" className="cta-btn">
                  지금 제작문의
                  <span className="cta-icon">↗</span>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
                {[['100+', '제작 완료'], ['99%', '고객 만족도'], ['1일', '평균 제작일']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#1ed760', letterSpacing: '-0.03em' }}>{n}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — phone */}
          <div className="hero-phone" style={{ display: 'flex', justifyContent: 'center' }}>
            <Reveal delay={200}>
              <PhoneMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Bento Features ── */}
      <section style={{ padding: '0 24px 120px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="pill-tag" style={{ marginBottom: 20 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              명함 그 이상의 경험
            </h2>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '120px', gap: 12 }}
          className="bento-grid">
          <style>{`
            @media(max-width:768px){
              .bento-grid > * { grid-column: span 12 !important; grid-row: span 2 !important; }
            }
          `}</style>

          {/* Card 1 — big */}
          <Reveal className="bento-grid-item" delay={0} style={{ gridColumn: 'span 7', gridRow: 'span 3' } as React.CSSProperties}>
            <BentoCard className="h-full" glowColor="rgba(30,215,96,0.06)">
              <div className="pill-tag" style={{ marginBottom: 20 }}>즉시 공유</div>
              <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.2 }}>
                링크 하나로<br /><span className="green">모든 것을</span> 공유
              </h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>
                QR 코드, URL 한 줄이면 끝. 카카오톡, 문자, 인스타 어디서든 바로 명함을 전달하세요.
              </p>
              {/* Mini QR visual */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3, width: 80 }}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 2, background: Math.random() > 0.4 ? '#1ed760' : '#1a1a1a' }} />
                ))}
              </div>
            </BentoCard>
          </Reveal>

          {/* Card 2 */}
          <Reveal delay={80} style={{ gridColumn: 'span 5', gridRow: 'span 2' } as React.CSSProperties}>
            <BentoCard className="h-full">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎨</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>테마 커스텀</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>브랜드 컬러에 맞춘 나만의 명함 색상.</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                {['#1ed760','#2563eb','#dc2626','#9333ea','#ea580c'].map(c => (
                  <div key={c} style={{ width: 22, height: 22, borderRadius: '50%', background: c }} />
                ))}
              </div>
            </BentoCard>
          </Reveal>

          {/* Card 3 */}
          <Reveal delay={120} style={{ gridColumn: 'span 5', gridRow: 'span 1' } as React.CSSProperties}>
            <BentoCard className="h-full">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%' }}>
                <span style={{ fontSize: 28 }}>📊</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>방문자 카운터</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>실시간 조회수 확인</div>
                </div>
              </div>
            </BentoCard>
          </Reveal>

          {/* Card 4 */}
          <Reveal delay={160} style={{ gridColumn: 'span 4', gridRow: 'span 2' } as React.CSSProperties}>
            <BentoCard className="h-full">
              <div style={{ fontSize: 32, marginBottom: 12 }}>📷</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>갤러리</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>포트폴리오, 제품 사진을 명함에 담으세요.</p>
            </BentoCard>
          </Reveal>

          {/* Card 5 */}
          <Reveal delay={200} style={{ gridColumn: 'span 4', gridRow: 'span 2' } as React.CSSProperties}>
            <BentoCard className="h-full" glowColor="rgba(30,215,96,0.04)">
              <div style={{ fontSize: 32, marginBottom: 12 }}>💾</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>연락처 저장</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>버튼 하나로 스마트폰 주소록에 바로 저장.</p>
            </BentoCard>
          </Reveal>

          {/* Card 6 — dark/light */}
          <Reveal delay={240} style={{ gridColumn: 'span 4', gridRow: 'span 2' } as React.CSSProperties}>
            <BentoCard className="h-full">
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#121212', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌙</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☀️</div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>다크 / 라이트</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>방문자가 원하는 테마로 전환.</p>
            </BentoCard>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '0 24px 120px', maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="pill-tag" style={{ marginBottom: 20 }}>Process</div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              단 3단계, 하루면 완성
            </h2>
          </div>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { n: '01', title: '정보 전달', desc: '이름, 연락처, SNS, 사진 등 원하는 정보를 전달해 주세요.' },
            { n: '02', title: '디자인 제작', desc: '브랜드에 맞는 테마 컬러와 레이아웃으로 명함을 제작합니다.' },
            { n: '03', title: '링크 전달', desc: 'URL과 QR 코드를 바로 받아 즉시 공유하세요.' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <BentoCard>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div className="step-num">{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, letterSpacing: '-0.01em' }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: '#777', lineHeight: 1.7 }}>{s.desc}</div>
                  </div>
                </div>
              </BentoCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '0 24px 120px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30,215,96,0.12) 0%, rgba(30,215,96,0.03) 100%)',
            border: '1px solid rgba(30,215,96,0.2)',
            borderRadius: 32, padding: '60px 48px', textAlign: 'center',
            boxShadow: '0 0 80px rgba(30,215,96,0.08)',
          }}>
            <div className="pill-tag" style={{ marginBottom: 24 }}>Get Started</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              지금 바로 시작하세요
            </h2>
            <p style={{ color: '#888', fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
              종이 명함 인쇄 비용보다 저렴하게,<br />훨씬 강력한 디지털 명함을 만들어 드립니다.
            </p>
            <Link href="/contact" className="cta-btn" style={{ fontSize: 15, padding: '16px 32px' }}>
              무료 상담 신청하기
              <span className="cta-icon" style={{ width: 34, height: 34, fontSize: 16 }}>↗</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>
          MY NAME IS<span className="green">.</span>
        </span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#555' }}>마그네이트코리아</span>
          <a href="mailto:official@magnatekorea.com" style={{ fontSize: 13, color: '#555', textDecoration: 'none' }}>official@magnatekorea.com</a>
          <Link href="/privacy" style={{ fontSize: 13, color: '#555', textDecoration: 'none' }}>개인정보처리방침</Link>
        </div>
      </footer>
    </div>
  )
}
