'use client'
// app/page.tsx — MY NAME IS Landing Page
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }, { threshold: 0.08 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = '', style = {} }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.8s cubic-bezier(0.32,0.72,0,1) ${delay}ms, transform 0.8s cubic-bezier(0.32,0.72,0,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

function PhoneMockup() {
  return (
    <div style={{ perspective: '900px' }}>
      <div style={{
        width: 200, borderRadius: 32,
        background: '#0a0a0a', border: '7px solid #1a1a1a',
        boxShadow: '0 0 0 1px #2a2a2a, 0 40px 80px rgba(30,215,96,0.18)',
        overflow: 'hidden',
        transform: 'rotateY(-10deg) rotateX(3deg)',
        transition: 'transform 0.9s cubic-bezier(0.32,0.72,0,1)',
      }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'rotateY(-3deg) rotateX(1deg)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'rotateY(-10deg) rotateX(3deg)')}
      >
        <div style={{ background: '#111', padding: '10px 16px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>9:41</span>
          <div style={{ width: 60, height: 14, background: '#000', borderRadius: 10, border: '1px solid #222' }} />
          <span style={{ fontSize: 10, color: '#fff' }}>●●●</span>
        </div>
        <div style={{ height: 60, background: 'linear-gradient(135deg, #1ed760 0%, #0a8f40 100%)' }} />
        <div style={{ background: '#121212', padding: '0 12px 14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1ed760', border: '3px solid #121212', marginTop: -22, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
          <div style={{ height: 9, width: 70, background: '#fff', borderRadius: 4, marginBottom: 4 }} />
          <div style={{ height: 6, width: 48, background: '#444', borderRadius: 4 }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#1a2a1a', border: '1px solid #2a4a2a', borderRadius: 999, padding: '2px 8px', marginBottom: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 7, color: '#22c55e', fontWeight: 600 }}>온라인</span>
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
            {['전화', '문자', '저장', 'QR'].map(l => (
              <div key={l} style={{ flex: 1, background: '#1f1f1f', borderRadius: 20, padding: '6px 2px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
                <div style={{ fontSize: 6, color: '#b3b3b3', fontWeight: 700 }}>{l}</div>
              </div>
            ))}
          </div>
          {['홈페이지', '인스타그램', '유튜브'].map(l => (
            <div key={l} style={{ background: '#181818', borderRadius: 8, padding: '7px 8px', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #222' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1ed760', flexShrink: 0 }} />
              <div style={{ height: 5, flex: 1, background: '#333', borderRadius: 3 }} />
              <div style={{ fontSize: 7, color: '#1ed760' }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BentoCard({ children, glowColor = '' }: { children: React.ReactNode; glowColor?: string }) {
  return (
    <div className="bento-card" style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20, padding: 1.5, height: '100%',
      boxShadow: glowColor ? `0 0 50px ${glowColor}` : 'none',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
        borderRadius: 19, padding: 20, height: '100%',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [, setMenuOpen] = useState(false)

  return (
    <div style={{ background: '#050505', minHeight: '100dvh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #1ed76033; }
        .green { color: #1ed760; }

        .pill-tag {
          display: inline-flex; align-items: center;
          background: rgba(30,215,96,0.1); border: 1px solid rgba(30,215,96,0.25);
          color: #1ed760; border-radius: 999px;
          padding: 5px 14px; font-size: 10px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase; white-space: nowrap;
        }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1ed760; color: #000;
          border-radius: 999px; padding: 14px 22px;
          font-size: 14px; font-weight: 700; letter-spacing: 0.03em;
          text-decoration: none; border: none; cursor: pointer; white-space: nowrap;
          transition: transform 0.4s cubic-bezier(0.32,0.72,0,1), box-shadow 0.4s cubic-bezier(0.32,0.72,0,1);
        }
        .cta-btn:hover { transform: scale(1.04); box-shadow: 0 0 36px rgba(30,215,96,0.4); }
        .cta-btn:active { transform: scale(0.97); }
        .cta-icon {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;
          font-size: 13px; transition: transform 0.4s cubic-bezier(0.32,0.72,0,1);
        }
        .cta-btn:hover .cta-icon { transform: translate(2px,-2px) scale(1.1); }

        .step-num {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          background: rgba(30,215,96,0.1); border: 1px solid rgba(30,215,96,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #1ed760;
        }

        /* ── Hero ── */
        .hero-section {
          min-height: 100dvh; display: flex; align-items: center;
          padding: 100px 20px 60px; max-width: 1100px; margin: 0 auto;
        }
        .hero-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: center; width: 100%;
        }
        .hero-phone { display: flex; justify-content: center; }

        /* ── Bento ── */
        .bento-section { padding: 0 20px 80px; max-width: 1100px; margin: 0 auto; }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: repeat(6, 120px);
          gap: 10px;
        }
        .bento-c1 { grid-column: span 7; grid-row: span 3; }
        .bento-c2 { grid-column: span 5; grid-row: span 2; }
        .bento-c3 { grid-column: span 5; grid-row: span 1; }
        .bento-c4 { grid-column: span 4; grid-row: span 2; }
        .bento-c5 { grid-column: span 4; grid-row: span 2; }
        .bento-c6 { grid-column: span 4; grid-row: span 2; }
        .bento-c7 { grid-column: span 12; grid-row: span 1; }

        /* ── CTA banner ── */
        .cta-banner { padding: 48px 32px; border-radius: 24px; text-align: center; }

        /* ── Footer ── */
        .footer-inner {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        .footer-links { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }

        /* ════ MOBILE ════ */
        @media (max-width: 768px) {
          .hero-section { padding: 88px 16px 48px; min-height: auto; }
          .hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .hero-phone { display: none; }

          .bento-section { padding: 0 16px 64px; }
          .bento-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: none;
            grid-auto-rows: auto;
            gap: 10px;
          }
          .bento-c1 { grid-column: span 2; grid-row: auto; }
          .bento-c2 { grid-column: span 2; grid-row: auto; }
          .bento-c3 { grid-column: span 2; grid-row: auto; }
          .bento-c4 { grid-column: span 1; grid-row: auto; }
          .bento-c5 { grid-column: span 1; grid-row: auto; }
          .bento-c6 { grid-column: span 2; grid-row: auto; }
          .bento-c7 { grid-column: span 2; grid-row: auto; }
          .bento-card > div { padding: 16px; }

          .cta-banner { padding: 36px 20px; border-radius: 20px; }
          .cta-banner h2 { font-size: 26px !important; }
          .cta-banner p { font-size: 14px !important; }
          .cta-banner .cta-btn { width: 100%; justify-content: center; }

          .footer-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
          .footer-links { flex-direction: column; align-items: flex-start; gap: 10px; }

          h1 { word-break: keep-all; }
          h2 { word-break: keep-all; }
          p { word-break: keep-all; }
        }

        @media (max-width: 400px) {
          .bento-grid { grid-template-columns: 1fr; }
          .bento-c4 { grid-column: span 1; }
          .bento-c5 { grid-column: span 1; }
        }
      `}</style>

      {/* ── Floating Nav ── */}
      <nav style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: 'calc(100% - 24px)', maxWidth: 640 }}>
        <div style={{
          background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999,
          padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            MY NAME IS<span className="green">.</span>
          </span>
          <Link href="/contact" className="cta-btn" style={{ padding: '8px 16px', fontSize: 12 }}>
            제작문의
            <span className="cta-icon" style={{ width: 22, height: 22, fontSize: 11 }}>↗</span>
          </Link>
        </div>
      </nav>

      {/* ── Ambient orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,215,96,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,215,96,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Hero ── */}
      <section className="hero-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-grid">
          <div>
            <Reveal>
              <div className="pill-tag" style={{ marginBottom: 20 }}>Digital Business Card</div>
            </Reveal>
            <Reveal delay={80}>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
                당신의 명함을<br />
                <span className="green">스마트하게</span><br />
                디지털로.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: 15, color: '#888', lineHeight: 1.75, marginBottom: 28 }}>
                다국어 지원, 실시간 상태 표시, 맞춤 인트로까지. 단순한 명함을 넘어선 나만의 디지털 프로필.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <Link href="/contact" className="cta-btn">
                지금 제작문의
                <span className="cta-icon">↗</span>
              </Link>
            </Reveal>
            <Reveal delay={300}>
              <div style={{ display: 'flex', gap: 28, marginTop: 36, flexWrap: 'wrap' }}>
                {[['300+', '제작 완료'], ['7가지', '핵심 기능'], ['4개국어', '다국어 지원']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#1ed760', letterSpacing: '-0.03em' }}>{n}</div>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="hero-phone">
            <Reveal delay={180}>
              <PhoneMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Bento Features ── */}
      <section className="bento-section" style={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="pill-tag" style={{ marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginTop: 8 }}>
              명함 그 이상의 경험
            </h2>
          </div>
        </Reveal>

        <div className="bento-grid">
          <Reveal className="bento-c1" delay={0}>
            <BentoCard glowColor="rgba(30,215,96,0.05)">
              <div className="pill-tag" style={{ marginBottom: 14 }}>즉시 공유</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.25 }}>
                링크 하나로<br /><span className="green">모든 것을</span> 공유
              </h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65, marginBottom: 18 }}>
                QR 코드, URL 한 줄이면 끝. 링크 복사 버튼과 SNS 공유로 카카오톡, 문자, 어디서든 바로 명함 전달.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3, width: 72 }}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 2, background: [0,1,6,7,12,13,5,11,17,23,24,25,30,31,35].includes(i) ? '#1ed760' : '#1a1a1a' }} />
                ))}
              </div>
            </BentoCard>
          </Reveal>

          <Reveal className="bento-c2" delay={60}>
            <BentoCard>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🌐</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>다국어 지원</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>한국어 · English · 日本語 — 클릭 한 번으로 언어 전환.</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                {['KO', 'EN', 'JP'].map(lang => (
                  <div key={lang} style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(30,215,96,0.1)', border: '1px solid rgba(30,215,96,0.25)', fontSize: 11, fontWeight: 700, color: '#1ed760' }}>{lang}</div>
                ))}
              </div>
            </BentoCard>
          </Reveal>

          <Reveal className="bento-c3" delay={90}>
            <BentoCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🟢</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>온라인</div>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🏖️</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>휴가중</div>
              </div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>실시간 상태 · PIN 보호</div>
            </BentoCard>
          </Reveal>

          <Reveal className="bento-c4" delay={120}>
            <BentoCard>
              <div style={{ fontSize: 26, marginBottom: 8 }}>📷</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>갤러리</h3>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55 }}>포트폴리오, 제품 사진도 명함에.</p>
              <div style={{ fontSize: 10, color: '#1ed760', fontWeight: 600, marginTop: 8 }}>← 스와이프 지원 →</div>
            </BentoCard>
          </Reveal>

          <Reveal className="bento-c5" delay={150}>
            <BentoCard glowColor="rgba(30,215,96,0.04)">
              <div style={{ fontSize: 26, marginBottom: 8 }}>🎬</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>인트로 애니메이션</h3>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55 }}>5가지 맞춤 인트로 효과.</p>
            </BentoCard>
          </Reveal>

          <Reveal className="bento-c6" delay={180}>
            <BentoCard>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#121212', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🌙</div>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f0f0f0', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>☀️</div>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>다크 / 라이트</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>방문자가 원하는 테마로 전환.</p>
            </BentoCard>
          </Reveal>

          <Reveal className="bento-c7" delay={210}>
            <BentoCard glowColor="rgba(30,215,96,0.06)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: '100%', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 32 }}>🪪</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                      실물 <span className="green">QR · NFC</span> 명함 제작
                    </div>
                    <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0 }}>
                      디지털 명함 링크가 담긴 QR코드 카드 · NFC 태그 카드를 실물로 제작합니다. 명함을 건네는 순간, 스마트폰으로 바로 연결.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
                  {['QR 인쇄 명함', 'NFC 태그 카드', '금속 / 플라스틱'].map(tag => (
                    <div key={tag} style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(30,215,96,0.1)', border: '1px solid rgba(30,215,96,0.25)', fontSize: 11, fontWeight: 700, color: '#1ed760', whiteSpace: 'nowrap' }}>{tag}</div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '0 20px 80px', maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="pill-tag" style={{ marginBottom: 16 }}>Process</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginTop: 8 }}>
              단 4단계, 하루면 완성
            </h2>
          </div>
        </Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { n: '01', title: '정보 전달', desc: '이름, 연락처, SNS, 사진 등 원하는 정보를 전달해 주세요.' },
            { n: '02', title: '디자인 제작', desc: '브랜드에 맞는 테마 컬러와 레이아웃으로 명함을 제작합니다.' },
            { n: '03', title: '링크 전달', desc: 'URL과 QR 코드를 바로 받아 즉시 공유하세요.' },
            { n: '04', title: '링크 공유', desc: 'URL, QR코드, SNS 공유 버튼으로 어디서든 즉시 명함 전달.' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '20px 22px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div className="step-num">{s.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5, letterSpacing: '-0.01em' }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '0 20px 80px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div className="cta-banner" style={{
            background: 'linear-gradient(135deg, rgba(30,215,96,0.1) 0%, rgba(30,215,96,0.02) 100%)',
            border: '1px solid rgba(30,215,96,0.18)',
            boxShadow: '0 0 60px rgba(30,215,96,0.07)',
          }}>
            <div className="pill-tag" style={{ marginBottom: 20 }}>Get Started</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              지금 바로 시작하세요
            </h2>
            <p style={{ color: '#777', fontSize: 15, marginBottom: 28, lineHeight: 1.65 }}>
              다국어 지원부터 맞춤 인트로까지, 종이 명함이 줄 수 없는 경험을 제공합니다.
            </p>
            <Link href="/contact" className="cta-btn" style={{ fontSize: 14, padding: '15px 28px' }}>
              무료 상담 신청하기
              <span className="cta-icon" style={{ width: 30, height: 30, fontSize: 14 }}>↗</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 20px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="footer-inner">
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em' }}>
            MY NAME IS<span className="green">.</span>
          </span>
          <div className="footer-links">
            <span style={{ fontSize: 12, color: '#444' }}>마그네이트코리아</span>
            <a href="mailto:official@magnatekorea.com" style={{ fontSize: 12, color: '#444', textDecoration: 'none' }}>official@magnatekorea.com</a>
            <Link href="/privacy" style={{ fontSize: 12, color: '#444', textDecoration: 'none' }}>개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
