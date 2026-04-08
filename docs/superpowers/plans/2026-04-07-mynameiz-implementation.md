# 마이네임이즈 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자가 고객의 모바일 명함 페이지를 제작·관리하는 대행 서비스를 Next.js 15 + Supabase + Cloudflare Pages로 구축한다.

**Architecture:** 고객 명함 페이지는 ISR(정적 생성 + 온디맨드 재검증)으로 CDN 서빙. 관리자 대시보드는 JWT 쿠키 인증으로 보호. Cloudflare Workers Edge Runtime에서 모든 서버 로직 실행.

**Tech Stack:** Next.js 15 (App Router, Edge Runtime), Supabase (PostgreSQL + Storage), Cloudflare Pages (`@cloudflare/next-on-pages`), Tailwind CSS v4, jose (JWT), DOMPurify, qrcode, Vitest

---

## File Map

```
app/
  [slug]/page.tsx               # 고객 명함 페이지 (ISR, 서버 컴포넌트)
  admin/login/page.tsx          # 관리자 로그인
  admin/page.tsx                # 고객 목록
  admin/[id]/page.tsx           # 명함 편집 (클라이언트 컴포넌트, runtime='edge' 없음)
  api/revalidate/route.ts       # ISR 재생성 (REVALIDATE_SECRET)
  api/views/route.ts            # 방문 기록 (rate-limit)
  api/admin/auth/route.ts       # 로그인/로그아웃
  api/admin/cards/route.ts      # 고객 목록 GET, 생성 POST
  api/admin/cards/[id]/route.ts # 단일 조회 GET, 수정 PUT, 삭제 DELETE
  api/admin/cards/[id]/social-links/route.ts         # SNS 링크 GET, POST
  api/admin/cards/[id]/social-links/[linkId]/route.ts # SNS 링크 DELETE
  api/admin/cards/[id]/gallery/route.ts              # 갤러리 GET, POST
  api/admin/cards/[id]/gallery/[imgId]/route.ts      # 갤러리 DELETE
  api/admin/upload/route.ts     # 이미지 업로드
  privacy/page.tsx              # 개인정보처리방침
  layout.tsx
  globals.css

components/card/
  HeroSection.tsx               # 프로필 사진 + 이름 + 직함
  ActionBar.tsx                 # 전화/문자/VCF/QR 버튼
  ActionBarWrapper.tsx          # ActionBar + QRModal 클라이언트 래퍼 (별도 파일)
  SocialLinks.tsx               # SNS 링크 목록
  ContactInfo.tsx               # 연락처 상세
  Gallery.tsx                   # 3열 그리드 + 모달
  ViewCounter.tsx               # 방문자 수

components/admin/
  CardList.tsx                  # 고객 목록 테이블
  CardEditor.tsx                # 기본정보 폼
  ThemePicker.tsx               # 프리셋 6 + HEX 입력
  SocialLinksEditor.tsx         # SNS 링크 CRUD
  GalleryEditor.tsx             # 이미지 업로드/삭제
  QRDownload.tsx                # QR PNG 다운로드

lib/
  supabase.ts                   # Supabase 서버 클라이언트
  supabase-browser.ts           # Supabase 브라우저 클라이언트
  auth.ts                       # JWT sign/verify (jose, Edge 호환)
  vcf.ts                        # VCF 파일 생성
  sanitize.ts                   # DOMPurify 래퍼
  rate-limit.ts                 # IP 해시 + 시간 기반 중복 방지

middleware.ts                   # /admin/* JWT 보호
supabase/migrations/001_initial.sql
wrangler.toml
.env.example
```

---

## Task 1: 프로젝트 초기 설정

**Files:**
- Create: `package.json`, `next.config.ts`, `wrangler.toml`, `.env.example`, `tsconfig.json`, `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Next.js 15 프로젝트 초기화**

```bash
cd C:/BIZWEB
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Cloudflare 어댑터 및 핵심 의존성 설치**

```bash
npm install @cloudflare/next-on-pages wrangler
npm install @supabase/supabase-js jose dompurify qrcode
npm install -D @types/dompurify @types/qrcode vitest @vitejs/plugin-react
```

- [ ] **Step 3: `next.config.ts` Edge Runtime 설정**

```typescript
// next.config.ts
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import type { NextConfig } from 'next'

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 4: `wrangler.toml` 생성**

```toml
name = "mynameiz"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

- [ ] **Step 5: `.env.example` 생성**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
ADMIN_PIN=your-secure-pin
JWT_SECRET=your-32-char-secret

# ISR
REVALIDATE_SECRET=your-revalidate-secret

# App
NEXT_PUBLIC_BASE_URL=https://mynameiz.com
```

- [ ] **Step 6: `.env.local` 생성 (gitignored)**

`.env.example`을 복사해 실제 값 입력. `.gitignore`에 `.env.local`, `.dev.vars` 추가 확인.

- [ ] **Step 7: `app/layout.tsx` 기본 설정**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '마이네임이즈',
  description: '모바일 디지털 명함 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: 빌드 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000` 접속 가능

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 15 project with Cloudflare adapter"
```

---

## Task 2: Supabase DB 마이그레이션

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Supabase 프로젝트 생성**

[supabase.com](https://supabase.com) 에서 새 프로젝트 생성 후 URL, anon key, service role key를 `.env.local`에 입력.

- [ ] **Step 2: 마이그레이션 파일 작성**

```sql
-- supabase/migrations/001_initial.sql

-- cards 테이블
CREATE TABLE cards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  title         text,
  company       text,
  phone         text,
  email         text,
  address       text,
  website       text,
  bio           text,
  profile_image_url text,
  theme_color   text NOT NULL DEFAULT '#2563eb',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- social_links 테이블
CREATE TABLE social_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  platform    text NOT NULL,
  url         text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

-- gallery_images 테이블
CREATE TABLE gallery_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  caption     text,
  sort_order  int NOT NULL DEFAULT 0
);

-- page_views 테이블
CREATE TABLE page_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  ip_hash     text NOT NULL,
  viewed_at   timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 활성화 (public 읽기, service role만 쓰기)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (활성 카드만)
CREATE POLICY "public_read_active_cards" ON cards
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_social_links" ON social_links
  FOR SELECT USING (true);

CREATE POLICY "public_read_gallery" ON gallery_images
  FOR SELECT USING (true);

-- page_views 공개 삽입 (rate-limit은 앱에서 처리)
CREATE POLICY "public_insert_views" ON page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_views" ON page_views
  FOR SELECT USING (true);
```

- [ ] **Step 3: SQL 실행**

Supabase 대시보드 → SQL Editor → 위 SQL 붙여넣기 후 실행.

- [ ] **Step 4: Storage 버킷 생성**

Supabase 대시보드 → Storage → "New bucket":
- Bucket name: `card-images`
- Public bucket: ✅ (이미지 공개 읽기)

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase migration and storage config"
```

---

## Task 3: 핵심 라이브러리

**Files:**
- Create: `lib/supabase.ts`, `lib/supabase-browser.ts`, `lib/auth.ts`, `lib/vcf.ts`, `lib/sanitize.ts`, `lib/rate-limit.ts`
- Create: `lib/__tests__/vcf.test.ts`, `lib/__tests__/auth.test.ts`, `lib/__tests__/rate-limit.test.ts`

- [ ] **Step 1: Vitest 설정**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 2: VCF 테스트 작성**

```typescript
// lib/__tests__/vcf.test.ts
import { describe, it, expect } from 'vitest'
import { generateVCF } from '../vcf'

describe('generateVCF', () => {
  it('필수 필드만 있는 VCF 생성', () => {
    const vcf = generateVCF({ name: '홍길동', phone: '010-1234-5678' })
    expect(vcf).toContain('BEGIN:VCARD')
    expect(vcf).toContain('FN:홍길동')
    expect(vcf).toContain('TEL:010-1234-5678')
    expect(vcf).toContain('END:VCARD')
  })

  it('모든 필드 포함 VCF 생성', () => {
    const vcf = generateVCF({
      name: '김철수', phone: '010-9999-8888',
      email: 'kim@test.com', company: '테스트회사', title: '팀장',
    })
    expect(vcf).toContain('EMAIL:kim@test.com')
    expect(vcf).toContain('ORG:테스트회사')
    expect(vcf).toContain('TITLE:팀장')
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
npx vitest run lib/__tests__/vcf.test.ts
```
Expected: FAIL (vcf.ts 없음)

- [ ] **Step 4: `lib/vcf.ts` 구현**

```typescript
// lib/vcf.ts
interface VCFData {
  name: string
  phone?: string
  email?: string
  company?: string
  title?: string
  address?: string
  website?: string
}

export function generateVCF(data: VCFData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `N:${data.name};;;`,
  ]
  if (data.phone)   lines.push(`TEL;TYPE=CELL:${data.phone}`)
  if (data.email)   lines.push(`EMAIL:${data.email}`)
  if (data.company) lines.push(`ORG:${data.company}`)
  if (data.title)   lines.push(`TITLE:${data.title}`)
  if (data.address) lines.push(`ADR:;;${data.address};;;;`)
  if (data.website) lines.push(`URL:${data.website}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}
```

- [ ] **Step 5: VCF 테스트 통과 확인**

```bash
npx vitest run lib/__tests__/vcf.test.ts
```
Expected: PASS

- [ ] **Step 6: Rate-limit 테스트 작성**

```typescript
// lib/__tests__/rate-limit.test.ts
import { describe, it, expect } from 'vitest'
import { shouldCountView } from '../rate-limit'

describe('shouldCountView', () => {
  it('처음 방문은 카운트', async () => {
    const result = await shouldCountView('card-1', '192.168.1.1')
    expect(result).toBe(true)
  })

  it('1시간 내 재방문은 카운트 안 함', async () => {
    await shouldCountView('card-2', '192.168.1.2')
    const result = await shouldCountView('card-2', '192.168.1.2')
    expect(result).toBe(false)
  })

  it('다른 카드는 별도 카운트', async () => {
    await shouldCountView('card-3', '192.168.1.3')
    const result = await shouldCountView('card-4', '192.168.1.3')
    expect(result).toBe(true)
  })
})
```

- [ ] **Step 7: `lib/rate-limit.ts` 구현**

```typescript
// lib/rate-limit.ts
// Cloudflare Workers는 요청 간 메모리 공유 안 됨 → DB 기반 중복 체크 사용
const ONE_HOUR_AGO = () => new Date(Date.now() - 60 * 60 * 1000).toISOString()

export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

// supabase 인스턴스를 인자로 받아 DB에서 중복 체크 (테스트 시 mock 주입 가능)
export async function shouldCountView(
  supabase: { from: Function },
  cardId: string,
  ip: string
): Promise<boolean> {
  const ipHash = await hashIP(ip)
  const { count } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('card_id', cardId)
    .eq('ip_hash', ipHash)
    .gte('viewed_at', ONE_HOUR_AGO())
  return (count ?? 0) === 0
}
```

- [ ] **Step 8: Rate-limit 테스트 통과 확인**

```bash
npx vitest run lib/__tests__/rate-limit.test.ts
```
Expected: PASS

- [ ] **Step 9: `lib/auth.ts` 구현 (jose — Edge 호환)**

```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE_NAME = 'admin_session'
const EXPIRY = '8h'

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(EXPIRY)
    .setIssuedAt()
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export { COOKIE_NAME }
```

- [ ] **Step 10: Auth 테스트 작성 및 통과 확인**

```typescript
// lib/__tests__/auth.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { signAdminToken, verifyAdminToken } from '../auth'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum!!'
})

describe('auth', () => {
  it('토큰 서명 후 검증 성공', async () => {
    const token = await signAdminToken()
    expect(await verifyAdminToken(token)).toBe(true)
  })

  it('잘못된 토큰 검증 실패', async () => {
    expect(await verifyAdminToken('invalid.token.here')).toBe(false)
  })
})
```

```bash
npx vitest run lib/__tests__/auth.test.ts
```
Expected: PASS

- [ ] **Step 11: `lib/supabase.ts` (서버) 구현**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

- [ ] **Step 12: `lib/supabase-browser.ts` (클라이언트) 구현**

```typescript
// lib/supabase-browser.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

- [ ] **Step 13: `lib/sanitize.ts` 구현**

```typescript
// lib/sanitize.ts
// DOMPurify는 브라우저 전용 — 서버에서는 기본 이스케이프 사용
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
```

- [ ] **Step 14: Commit**

```bash
git add lib/ vitest.config.ts
git commit -m "feat: add core libraries (supabase, auth, vcf, rate-limit, sanitize)"
```

---

## Task 4: 관리자 인증 미들웨어 & API

**Files:**
- Create: `middleware.ts`, `app/admin/login/page.tsx`, `app/api/admin/auth/route.ts`

- [ ] **Step 1: `middleware.ts` 작성**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin/login은 인증 불필요
  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```

- [ ] **Step 2: 로그인 API `app/api/admin/auth/route.ts`**

```typescript
// app/api/admin/auth/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }
  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8시간
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
```

- [ ] **Step 3: 로그인 페이지 `app/admin/login/page.tsx`**

```typescript
// app/admin/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('PIN이 올바르지 않습니다')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 로그인</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="PIN 입력"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            로그인
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: 개발 서버에서 로그인 테스트**

```bash
npm run dev
```
- `http://localhost:3000/admin` 접속 → `/admin/login` 리다이렉트 확인
- PIN 입력 → `/admin` 접근 확인

- [ ] **Step 5: Commit**

```bash
git add middleware.ts app/admin/login/ app/api/admin/auth/
git commit -m "feat: add admin auth middleware and login page"
```

---

## Task 5: 고객 명함 페이지 (ISR)

**Files:**
- Create: `app/[slug]/page.tsx`, `components/card/HeroSection.tsx`, `components/card/ActionBar.tsx`, `components/card/SocialLinks.tsx`, `components/card/ContactInfo.tsx`, `components/card/Gallery.tsx`, `components/card/ViewCounter.tsx`

- [ ] **Step 1: 카드 타입 정의 `lib/types.ts`**

```typescript
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
```

- [ ] **Step 2: `HeroSection.tsx`**

```typescript
// components/card/HeroSection.tsx
import Image from 'next/image'

interface Props {
  name: string
  title?: string
  company?: string
  profileImageUrl?: string
  themeColor: string
}

export function HeroSection({ name, title, company, profileImageUrl, themeColor }: Props) {
  return (
    <div className="relative">
      {/* 배경 */}
      <div className="h-32 w-full" style={{ backgroundColor: themeColor }} />
      {/* 프로필 */}
      <div className="px-5 pb-4">
        <div className="flex items-end gap-4 -mt-8">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm"
          >
            {profileImageUrl ? (
              <Image src={profileImageUrl} alt={name} width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">👤</div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            {title && <p className="text-sm text-gray-500">{title}</p>}
            {company && (
              <p className="text-sm font-medium" style={{ color: themeColor }}>{company}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: `ActionBar.tsx`**

```typescript
// components/card/ActionBar.tsx
'use client'
import { generateVCF } from '@/lib/vcf'
import type { Card } from '@/lib/types'

interface Props { card: Card; onQR: () => void }

export function ActionBar({ card, onQR }: Props) {
  function downloadVCF() {
    const vcf = generateVCF({
      name: card.name, phone: card.phone, email: card.email,
      company: card.company, title: card.title,
      address: card.address, website: card.website,
    })
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${card.name}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const btnClass = "flex flex-col items-center gap-1 flex-1 py-3 rounded-xl text-white text-xs font-medium transition-opacity hover:opacity-90 active:opacity-80"

  return (
    <div className="px-4 pb-4 flex gap-2">
      {card.phone && (
        <a href={`tel:${card.phone}`} className={btnClass} style={{ backgroundColor: card.theme_color }}>
          <span className="text-lg">📞</span>전화
        </a>
      )}
      {card.phone && (
        <a href={`sms:${card.phone}`} className={btnClass} style={{ backgroundColor: card.theme_color }}>
          <span className="text-lg">💬</span>문자
        </a>
      )}
      <button onClick={downloadVCF} className={btnClass} style={{ backgroundColor: card.theme_color }}>
        <span className="text-lg">💾</span>저장
      </button>
      <button onClick={onQR} className={btnClass} style={{ backgroundColor: card.theme_color }}>
        <span className="text-lg">📱</span>QR
      </button>
    </div>
  )
}
```

- [ ] **Step 4: `SocialLinks.tsx`**

```typescript
// components/card/SocialLinks.tsx
import type { SocialLink } from '@/lib/types'

const PLATFORM_ICONS: Record<string, { icon: string; label: string }> = {
  kakao:     { icon: '💬', label: '카카오톡' },
  instagram: { icon: '📷', label: '인스타그램' },
  youtube:   { icon: '▶️', label: '유튜브' },
  naver:     { icon: '🟢', label: '네이버 블로그' },
  facebook:  { icon: '🔵', label: '페이스북' },
  twitter:   { icon: '🐦', label: 'X(트위터)' },
  tiktok:    { icon: '🎵', label: '틱톡' },
  link:      { icon: '🔗', label: '링크' },
}

interface Props { links: SocialLink[]; themeColor: string }

export function SocialLinks({ links, themeColor }: Props) {
  if (!links.length) return null
  return (
    <div className="px-4 pb-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">소셜 미디어</h2>
      <div className="flex flex-col gap-2">
        {links.map(link => {
          const meta = PLATFORM_ICONS[link.platform] ?? PLATFORM_ICONS.link
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl w-8 text-center">{meta.icon}</span>
              <span className="text-sm font-medium text-gray-700">{meta.label}</span>
              <span className="ml-auto text-gray-400 text-xs">→</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `ContactInfo.tsx`**

```typescript
// components/card/ContactInfo.tsx
import type { Card } from '@/lib/types'

interface Props { card: Card }

export function ContactInfo({ card }: Props) {
  const items = [
    card.phone   && { icon: '📞', label: '전화', value: card.phone,   href: `tel:${card.phone}` },
    card.email   && { icon: '✉️', label: '이메일', value: card.email,  href: `mailto:${card.email}` },
    card.address && { icon: '📍', label: '주소',   value: card.address, href: `https://map.naver.com/search?query=${encodeURIComponent(card.address)}` },
    card.website && { icon: '🌐', label: '홈페이지', value: card.website, href: card.website },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string }[]

  if (!items.length && !card.bio) return null

  return (
    <div className="px-4 pb-4">
      {card.bio && (
        <div className="mb-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 leading-relaxed">{card.bio}</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {items.map(item => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl w-8 text-center">{item.icon}</span>
            <div>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm text-gray-700 font-medium">{item.value}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: `Gallery.tsx`**

```typescript
// components/card/Gallery.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@/lib/types'

interface Props { images: GalleryImage[] }

export function Gallery({ images }: Props) {
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  if (!images.length) return null

  return (
    <div className="px-4 pb-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">갤러리</h2>
      <div className="grid grid-cols-3 gap-1">
        {images.map(img => (
          <button key={img.id} onClick={() => setSelected(img)} className="aspect-square overflow-hidden rounded-lg">
            <Image src={img.image_url} alt={img.caption ?? ''} width={200} height={200}
              className="object-cover w-full h-full hover:opacity-90 transition-opacity" />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <Image src={selected.image_url} alt={selected.caption ?? ''} width={500} height={500}
              className="rounded-xl object-contain w-full" />
            {selected.caption && (
              <p className="text-white text-center mt-2 text-sm">{selected.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: `ViewCounter.tsx`**

```typescript
// components/card/ViewCounter.tsx
'use client'
import { useEffect, useState } from 'react'

interface Props { cardId: string; initialCount: number }

export function ViewCounter({ cardId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    })
      .then(r => r.json())
      .then(d => { if (d.count) setCount(d.count) })
      .catch(() => {})
  }, [cardId])

  return (
    <div className="px-4 pb-6 text-center">
      <p className="text-xs text-gray-400">👁 {count.toLocaleString()}명이 방문했습니다</p>
    </div>
  )
}
```

- [ ] **Step 8: QR 모달 컴포넌트 `components/card/QRModal.tsx`**

```typescript
// components/card/QRModal.tsx
'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props { url: string; onClose: () => void }

export function QRModal({ url, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 240, margin: 2 })
    }
  }, [url])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-gray-900">QR 코드</h2>
        <canvas ref={canvasRef} />
        <button onClick={download} className="text-sm text-blue-600 font-medium">PNG 저장</button>
        <button onClick={onClose} className="text-sm text-gray-400">닫기</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 9a: `components/card/ActionBarWrapper.tsx` 생성 (클라이언트 전용)**

```typescript
// components/card/ActionBarWrapper.tsx
'use client'
import { useState } from 'react'
import { ActionBar } from './ActionBar'
import { QRModal } from './QRModal'
import type { Card } from '@/lib/types'

export function ActionBarWrapper({ card, pageUrl }: { card: Card; pageUrl: string }) {
  const [showQR, setShowQR] = useState(false)
  return (
    <>
      <ActionBar card={card} onQR={() => setShowQR(true)} />
      {showQR && <QRModal url={pageUrl} onClose={() => setShowQR(false)} />}
    </>
  )
}
```

- [ ] **Step 9b: `app/[slug]/page.tsx` (ISR 서버 컴포넌트)**

```typescript
// app/[slug]/page.tsx
export const runtime = 'edge'
export const dynamicParams = true

import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase'
import { HeroSection } from '@/components/card/HeroSection'
import { ActionBarWrapper } from '@/components/card/ActionBarWrapper'
import { SocialLinks } from '@/components/card/SocialLinks'
import { ContactInfo } from '@/components/card/ContactInfo'
import { Gallery } from '@/components/card/Gallery'
import { ViewCounter } from '@/components/card/ViewCounter'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

async function getCardData(slug: string) {
  const supabase = getSupabaseServer()
  const { data: card } = await supabase
    .from('cards').select('*').eq('slug', slug).eq('is_active', true).single()
  if (!card) return null

  const [{ data: socialLinks }, { data: galleryImages }, { count }] = await Promise.all([
    supabase.from('social_links').select('*').eq('card_id', card.id).order('sort_order'),
    supabase.from('gallery_images').select('*').eq('card_id', card.id).order('sort_order'),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('card_id', card.id),
  ])

  return { card, socialLinks: socialLinks ?? [], galleryImages: galleryImages ?? [], viewCount: count ?? 0 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getCardData(slug)
  if (!data) return { title: '페이지를 찾을 수 없습니다' }
  return {
    title: `${data.card.name} | 마이네임이즈`,
    description: data.card.bio ?? `${data.card.name}의 디지털 명함`,
  }
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params
  const data = await getCardData(slug)
  if (!data) notFound()

  const { card, socialLinks, galleryImages, viewCount } = data
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`

  return (
    <main className="min-h-screen bg-white max-w-md mx-auto">
      <HeroSection
        name={card.name} title={card.title} company={card.company}
        profileImageUrl={card.profile_image_url} themeColor={card.theme_color}
      />
      <ActionBarWrapper card={card} pageUrl={pageUrl} />
      <SocialLinks links={socialLinks} themeColor={card.theme_color} />
      <ContactInfo card={card} />
      <Gallery images={galleryImages} />
      <ViewCounter cardId={card.id} initialCount={viewCount} />
      <footer className="text-center pb-8 pt-2">
        <a href="/privacy" className="text-xs text-gray-300 hover:text-gray-400">개인정보처리방침</a>
      </footer>
    </main>
  )
}
```

- [ ] **Step 10: 개발 서버에서 확인**

Supabase에 테스트 카드 데이터 직접 삽입 후:
```bash
npm run dev
# http://localhost:3000/test-slug 접속 확인
```

- [ ] **Step 11: Commit**

```bash
git add app/\[slug\]/ components/card/ lib/types.ts
git commit -m "feat: add customer card page with ISR and all sections"
```

---

## Task 6: 방문자 API & Revalidate API

**Files:**
- Create: `app/api/views/route.ts`, `app/api/revalidate/route.ts`

- [ ] **Step 1: `app/api/views/route.ts`**

```typescript
// app/api/views/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { shouldCountView, hashIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { cardId } = await req.json()
  if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 })

  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '0.0.0.0'
  const shouldCount = await shouldCountView(cardId, ip)

  const supabase = getSupabaseServer()

  if (shouldCount) {
    const ipHash = await hashIP(ip)
    await supabase.from('page_views').insert({ card_id: cardId, ip_hash: ipHash })
  }

  const { count } = await supabase
    .from('page_views').select('*', { count: 'exact', head: true }).eq('card_id', cardId)

  return NextResponse.json({ count: count ?? 0 })
}
```

- [ ] **Step 2: `app/api/revalidate/route.ts`**

```typescript
// app/api/revalidate/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  revalidatePath(`/${slug}`)
  return NextResponse.json({ revalidated: true, slug })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/views/ app/api/revalidate/
git commit -m "feat: add views tracking and ISR revalidation API"
```

---

## Task 7: 관리자 카드 CRUD API

**Files:**
- Create: `app/api/admin/cards/route.ts`, `app/api/admin/cards/[id]/route.ts`, `app/api/admin/cards/[id]/social-links/route.ts`, `app/api/admin/cards/[id]/social-links/[linkId]/route.ts`, `app/api/admin/cards/[id]/gallery/route.ts`, `app/api/admin/cards/[id]/gallery/[imgId]/route.ts`, `app/api/admin/upload/route.ts`

- [ ] **Step 1: `lib/admin-auth.ts` — API 인증 헬퍼**

```typescript
// lib/admin-auth.ts
import { NextRequest } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from './auth'

export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}
```

- [ ] **Step 2: `app/api/admin/cards/route.ts` (목록 GET + 생성 POST)**

```typescript
// app/api/admin/cards/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.name || !body.slug) return NextResponse.json({ error: 'name, slug required' }, { status: 400 })
  // slug: 영문소문자, 숫자, 하이픈만 허용
  if (!/^[a-z0-9-]+$/.test(body.slug)) {
    return NextResponse.json({ error: 'slug는 영문 소문자, 숫자, 하이픈만 가능' }, { status: 400 })
  }
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('cards').insert({
    slug: body.slug, name: body.name, title: body.title, company: body.company,
    phone: body.phone, email: body.email, address: body.address,
    website: body.website, bio: body.bio,
    profile_image_url: body.profile_image_url,
    theme_color: body.theme_color ?? '#2563eb',
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 3: `app/api/admin/cards/[id]/route.ts` (수정 PUT + 삭제 DELETE)**

```typescript
// app/api/admin/cards/[id]/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('cards').update({
    name: body.name, title: body.title, company: body.company,
    phone: body.phone, email: body.email, address: body.address,
    website: body.website, bio: body.bio,
    profile_image_url: body.profile_image_url,
    theme_color: body.theme_color, is_active: body.is_active,
  }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // 온디맨드 ISR 재생성
  revalidatePath(`/${data.slug}`)
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: SNS 링크 API**

```typescript
// app/api/admin/cards/[id]/social-links/route.ts
export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { platform, url, sort_order } = await req.json()
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('social_links')
    .insert({ card_id: id, platform, url, sort_order: sort_order ?? 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

```typescript
// app/api/admin/cards/[id]/social-links/[linkId]/route.ts
export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { linkId } = await params
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('social_links').delete().eq('id', linkId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: 갤러리 API (social-links와 동일 패턴)**

```typescript
// app/api/admin/cards/[id]/gallery/route.ts
export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { image_url, caption, sort_order } = await req.json()
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('gallery_images')
    .insert({ card_id: id, image_url, caption, sort_order: sort_order ?? 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

```typescript
// app/api/admin/cards/[id]/gallery/[imgId]/route.ts
export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ imgId: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { imgId } = await params
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('gallery_images').delete().eq('id', imgId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 6: 이미지 업로드 API**

```typescript
// app/api/admin/upload/route.ts
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: '허용되지 않는 파일 형식' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: '파일 크기는 5MB 이하' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = await file.arrayBuffer()

  const supabase = getSupabaseServer()
  const { error } = await supabase.storage.from('card-images').upload(fileName, buffer, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(fileName)
  return NextResponse.json({ url: publicUrl })
}
```

- [ ] **Step 7: Commit**

```bash
git add app/api/admin/ lib/admin-auth.ts
git commit -m "feat: add admin CRUD API routes with JWT auth"
```

---

## Task 8: 관리자 대시보드 UI

**Files:**
- Create: `app/admin/page.tsx`, `app/admin/[id]/page.tsx`, `components/admin/CardList.tsx`, `components/admin/CardEditor.tsx`, `components/admin/ThemePicker.tsx`, `components/admin/SocialLinksEditor.tsx`, `components/admin/GalleryEditor.tsx`, `components/admin/QRDownload.tsx`

- [ ] **Step 1: `ThemePicker.tsx`**

```typescript
// components/admin/ThemePicker.tsx
'use client'
const PRESETS = [
  { label: '블루',   value: '#2563eb' },
  { label: '그린',   value: '#16a34a' },
  { label: '레드',   value: '#dc2626' },
  { label: '퍼플',   value: '#7c3aed' },
  { label: '골드',   value: '#d97706' },
  { label: '블랙',   value: '#0f172a' },
]

interface Props { value: string; onChange: (color: string) => void }

export function ThemePicker({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">테마 컬러</label>
      <div className="flex gap-2 flex-wrap mb-2">
        {PRESETS.map(p => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${value === p.value ? 'border-gray-900 scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: p.value }}
            title={p.label}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 font-mono"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `QRDownload.tsx`**

```typescript
// components/admin/QRDownload.tsx
'use client'
import { useRef, useEffect } from 'react'
import QRCode from 'qrcode'

export function QRDownload({ slug }: { slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`

  useEffect(() => {
    if (canvasRef.current) QRCode.toCanvas(canvasRef.current, url, { width: 160 })
  }, [url])

  function download() {
    const a = document.createElement('a')
    a.href = canvasRef.current!.toDataURL()
    a.download = `${slug}-qr.png`
    a.click()
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <canvas ref={canvasRef} className="rounded-lg" />
      <button type="button" onClick={download}
        className="text-sm text-blue-600 font-medium hover:underline">
        PNG 다운로드
      </button>
    </div>
  )
}
```

- [ ] **Step 3: `SocialLinksEditor.tsx`**

```typescript
// components/admin/SocialLinksEditor.tsx
'use client'
import { useState } from 'react'
import type { SocialLink } from '@/lib/types'

const PLATFORMS = ['kakao','instagram','youtube','naver','facebook','twitter','tiktok','link']

interface Props {
  cardId: string
  links: SocialLink[]
  onUpdate: () => void
}

export function SocialLinksEditor({ cardId, links, onUpdate }: Props) {
  const [platform, setPlatform] = useState('kakao')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function addLink(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    await fetch(`/api/admin/cards/${cardId}/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, url, sort_order: links.length }),
    })
    setUrl('')
    onUpdate()
    setLoading(false)
  }

  async function removeLink(linkId: string) {
    await fetch(`/api/admin/cards/${cardId}/social-links/${linkId}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">SNS 링크</label>
      <div className="flex flex-col gap-2 mb-3">
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-700">[{link.platform}] {link.url}</span>
            <button type="button" onClick={() => removeLink(link.id)} className="text-red-400 text-xs hover:text-red-600">삭제</button>
          </div>
        ))}
      </div>
      <form onSubmit={addLink} className="flex gap-2">
        <select value={platform} onChange={e => setPlatform(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL 입력"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1" />
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm disabled:opacity-50">추가</button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: `GalleryEditor.tsx`**

```typescript
// components/admin/GalleryEditor.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@/lib/types'

interface Props { cardId: string; images: GalleryImage[]; onUpdate: () => void }

export function GalleryEditor({ cardId, images, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const { url } = await uploadRes.json()
    await fetch(`/api/admin/cards/${cardId}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, sort_order: images.length }),
    })
    onUpdate()
    setUploading(false)
    e.target.value = ''
  }

  async function removeImage(imgId: string) {
    await fetch(`/api/admin/cards/${cardId}/gallery/${imgId}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">갤러리</label>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {images.map(img => (
          <div key={img.id} className="relative aspect-square">
            <Image src={img.image_url} alt="" fill className="object-cover rounded-lg" />
            <button type="button" onClick={() => removeImage(img.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
          </div>
        ))}
      </div>
      <label className={`inline-block cursor-pointer border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-blue-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {uploading ? '업로드 중...' : '+ 이미지 추가'}
        <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className="hidden" />
      </label>
    </div>
  )
}
```

- [ ] **Step 5: `CardEditor.tsx`**

```typescript
// components/admin/CardEditor.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ThemePicker } from './ThemePicker'
import { SocialLinksEditor } from './SocialLinksEditor'
import { GalleryEditor } from './GalleryEditor'
import { QRDownload } from './QRDownload'
import type { Card, SocialLink, GalleryImage } from '@/lib/types'

interface Props {
  card: Card
  socialLinks: SocialLink[]
  galleryImages: GalleryImage[]
  onRefresh: () => void
}

export function CardEditor({ card, socialLinks, galleryImages, onRefresh }: Props) {
  const [form, setForm] = useState({ ...card })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function uploadProfile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingProfile(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const { url } = await res.json()
    update('profile_image_url', url)
    setUploadingProfile(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setSaving(false)
    onRefresh()
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={save} className="space-y-6">
      {/* 프로필 이미지 */}
      <div>
        <label className={labelClass}>프로필 사진</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden">
            {form.profile_image_url
              ? <Image src={form.profile_image_url} alt="" width={64} height={64} className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
            }
          </div>
          <label className="cursor-pointer text-sm text-blue-600 font-medium hover:underline">
            {uploadingProfile ? '업로드 중...' : '사진 변경'}
            <input type="file" accept="image/*" onChange={uploadProfile} disabled={uploadingProfile} className="hidden" />
          </label>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>이름 *</label><input required value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>직함</label><input value={form.title ?? ''} onChange={e => update('title', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>회사</label><input value={form.company ?? ''} onChange={e => update('company', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>전화번호</label><input value={form.phone ?? ''} onChange={e => update('phone', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>이메일</label><input type="email" value={form.email ?? ''} onChange={e => update('email', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>홈페이지</label><input value={form.website ?? ''} onChange={e => update('website', e.target.value)} className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>주소</label><input value={form.address ?? ''} onChange={e => update('address', e.target.value)} className={inputClass} /></div>
      <div><label className={labelClass}>소개글</label><textarea value={form.bio ?? ''} onChange={e => update('bio', e.target.value)} rows={3} className={inputClass} /></div>

      {/* 테마 */}
      <ThemePicker value={form.theme_color} onChange={v => update('theme_color', v)} />

      {/* 활성 상태 */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} className="w-4 h-4" />
        <label htmlFor="active" className="text-sm text-gray-700">페이지 활성화</label>
      </div>

      {/* 저장 */}
      <button type="submit" disabled={saving}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {saving ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
      </button>

      <hr className="border-gray-100" />

      {/* SNS */}
      <SocialLinksEditor cardId={card.id} links={socialLinks} onUpdate={onRefresh} />

      <hr className="border-gray-100" />

      {/* 갤러리 */}
      <GalleryEditor cardId={card.id} images={galleryImages} onUpdate={onRefresh} />

      <hr className="border-gray-100" />

      {/* QR */}
      <div>
        <label className={labelClass}>QR 코드</label>
        <QRDownload slug={card.slug} />
      </div>
    </form>
  )
}
```

- [ ] **Step 6a: `app/api/admin/cards/[id]/route.ts`에 GET 핸들러 추가**

```typescript
// app/api/admin/cards/[id]/route.ts 의 GET 핸들러 (PUT/DELETE와 같은 파일)
export async function GET(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from('cards').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
```

- [ ] **Step 6b: `app/admin/[id]/page.tsx` — 편집 페이지 (클라이언트 컴포넌트)**

```typescript
// app/admin/[id]/page.tsx
// 주의: 'use client' 전용 페이지이므로 export const runtime = 'edge' 사용 안 함
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CardEditor } from '@/components/admin/CardEditor'
import type { Card, SocialLink, GalleryImage } from '@/lib/types'

export default function EditCardPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<{ card: Card; socialLinks: SocialLink[]; galleryImages: GalleryImage[] } | null>(null)

  const load = useCallback(async () => {
    const [card, links, gallery] = await Promise.all([
      fetch(`/api/admin/cards/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/cards/${id}/social-links`).then(r => r.json()).catch(() => []),
      fetch(`/api/admin/cards/${id}/gallery`).then(r => r.json()).catch(() => []),
    ])
    if (!card) return router.push('/admin')
    setData({ card, socialLinks: links, galleryImages: gallery })
  }, [id, router])

  useEffect(() => { load() }, [load])

  if (!data) return <div className="p-8 text-gray-400">불러오는 중...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600 text-sm">← 목록</button>
        <h1 className="text-xl font-bold text-gray-900">{data.card.name} 편집</h1>
        <a href={`/${data.card.slug}`} target="_blank" rel="noopener noreferrer"
          className="ml-auto text-sm text-blue-600 hover:underline">페이지 보기 →</a>
      </div>
      <CardEditor {...data} onRefresh={load} />
    </div>
  )
}
```

- [ ] **Step 7: `app/admin/page.tsx` — 목록 페이지**

```typescript
// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Card } from '@/lib/types'

export default function AdminPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [newName, setNewName] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/cards').then(r => r.json()).then(setCards)
  }, [])

  async function createCard(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newSlug, name: newName }),
    })
    const card = await res.json()
    if (res.ok) router.push(`/admin/${card.id}`)
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">고객 명함 목록</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowNew(true)}
            className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-700">
            + 새 명함
          </button>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">로그아웃</button>
        </div>
      </div>

      {showNew && (
        <form onSubmit={createCard} className="bg-gray-50 rounded-2xl p-4 mb-4 flex gap-3">
          <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase())}
            placeholder="slug (영문)" required
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="이름" required
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm">생성</button>
          <button type="button" onClick={() => setShowNew(false)} className="text-gray-400 text-sm px-2">취소</button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {cards.map(card => (
          <div key={card.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow transition-shadow">
            <div>
              <p className="font-semibold text-gray-900">{card.name}</p>
              <p className="text-sm text-gray-400">/{card.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${card.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {card.is_active ? '활성' : '비활성'}
              </span>
              <a href={`/${card.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-600">보기</a>
              <button onClick={() => router.push(`/admin/${card.id}`)} className="text-sm text-blue-600 font-medium hover:underline">편집</button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-gray-400 text-sm text-center py-8">아직 명함이 없습니다</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: `GET` 핸들러 추가 — social-links, gallery**

`app/api/admin/cards/[id]/social-links/route.ts`와 `gallery/route.ts`에 GET 핸들러 추가:

```typescript
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseServer()
  const { data } = await supabase.from('social_links').select('*').eq('card_id', id).order('sort_order')
  return NextResponse.json(data ?? [])
}
```

(gallery도 동일 패턴, `gallery_images` 테이블 사용)

- [ ] **Step 9: 통합 테스트**

```bash
npm run dev
```
- 로그인 → 고객 생성 → 편집 → 저장 → 고객 페이지 확인

- [ ] **Step 10: Commit**

```bash
git add app/admin/ components/admin/
git commit -m "feat: add admin dashboard with card list and full editor"
```

---

## Task 9: 개인정보처리방침 페이지

**Files:**
- Create: `app/privacy/page.tsx`

- [ ] **Step 1: `app/privacy/page.tsx`**

```typescript
// app/privacy/page.tsx
export const metadata = { title: '개인정보처리방침 | 마이네임이즈' }

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
      <div className="prose prose-sm text-gray-600 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-800">1. 수집하는 개인정보 항목</h2>
          <p>마이네임이즈는 디지털 명함 서비스 제공을 위해 다음 정보를 수집합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>성명, 직함, 소속회사</li>
            <li>전화번호, 이메일 주소</li>
            <li>주소, 홈페이지 URL</li>
            <li>프로필 사진, 소개글</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-800">2. 개인정보 수집 및 이용 목적</h2>
          <p>수집된 정보는 디지털 명함 페이지 생성 및 운영 목적으로만 사용됩니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-800">3. 개인정보 보유 및 이용 기간</h2>
          <p>서비스 이용 계약 종료 시 즉시 파기합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-800">4. 개인정보의 국외 이전</h2>
          <p>본 서비스는 Supabase(미국 AWS)를 통해 데이터를 처리합니다. 이는 개인정보의 국외 이전에 해당하며, 수탁업체는 Supabase Inc. (미국)입니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-800">5. 개인정보 처리 위탁</h2>
          <p>제3자에게 개인정보를 제공하지 않습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-800">6. 정보주체의 권리</h2>
          <p>개인정보 열람, 정정, 삭제를 요청하실 수 있습니다. 아래 이메일로 문의해 주세요.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-800">7. 개인정보 보호책임자</h2>
          <p>이메일: <a href="mailto:admin@mynameiz.com" className="text-blue-600">admin@mynameiz.com</a></p>
        </section>
        <p className="text-xs text-gray-400 mt-8">시행일: 2026년 4월 7일</p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/privacy/
git commit -m "feat: add privacy policy page (PIPA compliance)"
```

---

## Task 10: Cloudflare Pages 배포

**Files:**
- Modify: `package.json` (build 스크립트), `wrangler.toml`

- [ ] **Step 1: `package.json` 빌드 스크립트 추가**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "cf:build": "npx @cloudflare/next-on-pages",
    "cf:preview": "npm run cf:build && npx wrangler pages dev .vercel/output/static",
    "cf:deploy": "npm run cf:build && npx wrangler pages deploy .vercel/output/static"
  }
}
```

- [ ] **Step 2: `wrangler.toml` 최종 설정**

```toml
name = "mynameiz"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[vars]
NEXT_PUBLIC_BASE_URL = "https://mynameiz.pages.dev"
```

- [ ] **Step 3: `.gitignore` 확인**

```
.env.local
.dev.vars
.vercel/
.wrangler/
```

- [ ] **Step 4: Cloudflare Pages 프로젝트 생성**

[dash.cloudflare.com](https://dash.cloudflare.com) → Pages → "Create a project" → "Connect to Git" → BIZWEB 레포 연결:
- Framework: `Next.js`
- Build command: `npx @cloudflare/next-on-pages`
- Build output: `.vercel/output/static`
- Environment variables: `.env.example`의 모든 변수 입력

- [ ] **Step 5: 로컬 빌드 테스트**

```bash
npm run cf:build
```
Expected: `.vercel/output/static` 디렉토리 생성

- [ ] **Step 6: 최종 커밋 및 푸시**

```bash
git add .
git commit -m "feat: configure Cloudflare Pages deployment"
git push origin main
```
Expected: Cloudflare Pages 자동 배포 트리거

- [ ] **Step 7: 배포 확인**

- `https://mynameiz.pages.dev` 접속 확인
- `https://mynameiz.pages.dev/admin` 로그인 확인
- 고객 페이지 `https://mynameiz.pages.dev/test-slug` 확인

---

## Task 11: 최종 보안 점검

- [ ] **Step 1: Supabase RLS 정책 검증**

Supabase 대시보드 → Table Editor → 각 테이블 RLS 정책 확인:
- `cards`: anon 읽기 = `is_active = true`만
- `social_links`, `gallery_images`: anon 읽기 허용 (카드 페이지 렌더링용)
- `page_views`: anon 삽입 허용, service_role 전체 권한

- [ ] **Step 2: API 인증 엔드포인트 전수 확인**

모든 `/api/admin/*` 라우트에 `requireAdmin` 호출 확인. 누락 시 추가.

- [ ] **Step 3: 환경변수 노출 확인**

`NEXT_PUBLIC_` 접두사가 없는 변수가 클라이언트에 노출되지 않는지 확인:
- `SUPABASE_SERVICE_ROLE_KEY` — 서버 전용
- `ADMIN_PIN`, `JWT_SECRET`, `REVALIDATE_SECRET` — 서버 전용

- [ ] **Step 4: 전체 테스트 실행**

```bash
npx vitest run
```
Expected: 모든 테스트 PASS

- [ ] **Step 5: 최종 커밋**

```bash
git add .
git commit -m "chore: final security review and cleanup"
git push origin main
```
