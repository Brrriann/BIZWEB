# 마이네임이즈 (My Name Is) — 서비스 설계 문서

**날짜:** 2026-04-07
**서비스명:** 마이네임이즈
**유형:** 모바일 명함 겸 간이 홈페이지 대행 제작 서비스
**벤치마크:** miipick.blogspot.com

---

## 1. 서비스 개요

관리자(서비스 운영자)가 고객의 디지털 명함 페이지를 직접 제작·관리하는 **대행 서비스**. 고객은 URL 또는 QR코드를 받아 자신의 모바일 명함 페이지를 공유한다.

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | ISR 지원, 빠른 개발 |
| 데이터베이스 | Supabase (PostgreSQL) | 예측 가능한 비용, 파일 스토리지 포함 |
| 호스팅 | Cloudflare Pages | 무제한 대역폭, 300+ PoP, 콜드스타트 없음 |
| 렌더링 전략 | ISR + On-demand Revalidation | Cloudflare Cache API 활용, 트래픽 많아도 비용 최소 |
| 어댑터 | @cloudflare/next-on-pages + wrangler | Cloudflare Workers 엣지 런타임 |
| 인증 | 환경변수 PIN (관리자 전용) | 단순 대행 서비스에 충분 |
| 이미지 저장 | Supabase Storage | DB와 동일 플랫폼, 관리 단순 |
| QR 생성 | qrcode.js (클라이언트) | 서버 부하 없음 |

**예상 비용:** 고객 200명 기준 월 $0~25

---

## 3. 아키텍처

```
mynameiz.com/[slug]   → 고객 명함 페이지 (ISR, public)
mynameiz.com/admin    → 관리자 대시보드 (PIN 보호, SSR)
```

---

## 4. 고객 명함 페이지 (`/[slug]`)

### 4.1 섹션 구성 (위→아래)

1. **히어로 섹션** — 배경 테마 컬러 + 프로필 사진 + 이름 + 직함/회사
2. **액션 버튼 바** — 전화하기 · 문자하기 · 연락처 저장(VCF) · QR코드
3. **SNS 링크** — 플랫폼 아이콘 + 링크 (카카오톡, 인스타그램, 유튜브, 네이버블로그 등)
4. **연락처 상세** — 이메일, 주소, 웹사이트 (스마트 링크 처리)
5. **갤러리** (선택) — 3열 그리드, 이미지 클릭 시 모달
6. **방문자 카운터** — 총 방문 수 표시

### 4.2 테마

- **기본 스타일:** 클린 화이트 (B안)
- **테마 컬러:** 프리셋 6가지 (블루, 그린, 레드, 퍼플, 골드, 블랙) + 커스텀 HEX 입력
- CSS 변수 `--theme-color`로 전역 적용

### 4.3 ISR 전략

- `revalidate: false` (무기한 캐시, 자동 재검증 없음)
- `dynamicParams = true` (기본값) — 최초 방문 시 SSR로 렌더링 후 캐시. 이후 방문은 CDN 서빙
- 관리자 저장 시 `POST /api/revalidate` 호출 → 온디맨드 재생성 (REVALIDATE_SECRET 인증)
- 신규 고객 페이지 첫 방문은 1~3초 로딩, 이후 CDN 캐시로 즉시 로딩
- 저장 후 1~3초 내 반영

---

## 5. 관리자 대시보드 (`/admin`)

### 5.1 인증
- 환경변수 `ADMIN_PIN` 비교 후 서명된 JWT 쿠키 발급
- 쿠키: `httpOnly`, `secure`(prod), `sameSite: strict`, 만료 8시간
- 세션 만료 시 로그인 페이지로 리다이렉트
- MVP에서는 단일 관리자만 존재

### 5.2 기능
- **고객 목록** — 이름, 슬러그, 수정일, 활성 상태, 바로가기 링크
- **명함 편집** — 모든 필드 CRUD
  - 기본정보: 이름, 직함, 회사, 전화, 이메일, 주소, 소개글
  - 프로필 이미지 업로드
  - SNS 링크 추가/삭제/순서변경
  - 갤러리 이미지 업로드/삭제
  - 테마 컬러 선택
  - 활성/비활성 토글
- **저장** → 즉시 DB 업데이트 + revalidate API 호출
- **QR코드 다운로드** — PNG 이미지
- **방문자 통계** — 고객별 일별 방문 수

---

## 6. 데이터 모델 (Supabase)

### `cards`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
slug        text UNIQUE NOT NULL          -- URL 식별자
name        text NOT NULL                 -- 이름
title       text                          -- 직함
company     text                          -- 회사
phone       text                          -- 전화번호
email       text                          -- 이메일
address     text                          -- 주소
website     text                          -- 홈페이지
bio         text                          -- 소개글
profile_image_url text                    -- 프로필 사진
theme_color text DEFAULT '#2563eb'        -- 테마 컬러 HEX
is_active   boolean DEFAULT true
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

### `social_links`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
card_id     uuid REFERENCES cards(id) ON DELETE CASCADE
platform    text NOT NULL    -- kakao, instagram, youtube, naver, etc.
url         text NOT NULL
sort_order  int DEFAULT 0
```

### `gallery_images`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
card_id     uuid REFERENCES cards(id) ON DELETE CASCADE
image_url   text NOT NULL
caption     text
sort_order  int DEFAULT 0
```

### `page_views`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
card_id     uuid REFERENCES cards(id) ON DELETE CASCADE
viewed_at   timestamptz DEFAULT now()
```
**중복 처리:** 동일 IP + 동일 카드는 1시간 내 1회만 카운트 (서버사이드 IP 해시 비교, 원본 IP 미저장)

---

## 7. 주요 API 라우트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/revalidate` | REVALIDATE_SECRET 헤더 | ISR 페이지 재생성 |
| POST | `/api/admin/cards` | JWT 쿠키 | 고객 생성 |
| PUT | `/api/admin/cards/[id]` | JWT 쿠키 | 고객 기본정보 수정 |
| DELETE | `/api/admin/cards/[id]` | JWT 쿠키 | 고객 삭제 |
| POST | `/api/admin/cards/[id]/social-links` | JWT 쿠키 | SNS 링크 추가 |
| DELETE | `/api/admin/cards/[id]/social-links/[linkId]` | JWT 쿠키 | SNS 링크 삭제 |
| POST | `/api/admin/cards/[id]/gallery` | JWT 쿠키 | 갤러리 이미지 추가 |
| DELETE | `/api/admin/cards/[id]/gallery/[imgId]` | JWT 쿠키 | 갤러리 이미지 삭제 |
| POST | `/api/admin/upload` | JWT 쿠키 | Supabase Storage 업로드 |
| POST | `/api/views` | 없음 (rate-limit) | 방문 기록 |

---

## 8. 보안 및 법적 요구사항

### 8.1 보안 체크리스트
| 항목 | 대책 |
|------|------|
| SQL Injection | Supabase SDK 파라미터 바인딩 (직접 쿼리 금지) |
| XSS | Next.js 기본 이스케이핑 + DOMPurify (bio 등 자유 텍스트 렌더링 시) |
| CSRF | sameSite: strict 쿠키 + POST only mutation API |
| 인증 우회 | 모든 `/api/admin/*` 라우트에 JWT 미들웨어 강제 적용 |
| Revalidate 남용 | `REVALIDATE_SECRET` 환경변수 검증 필수 |
| 이미지 업로드 | MIME 타입 검증, 파일 크기 제한 (5MB), Supabase Storage 버킷 공개 읽기/비공개 쓰기 |
| 방문자 카운터 남용 | IP 기반 rate-limit (1시간/IP/페이지 1회) |
| 환경변수 노출 | `.env.local` gitignore, Vercel 환경변수로만 관리 |
| HTTPS | Vercel 자동 TLS, 개발환경 제외 `secure` 쿠키 강제 |

### 8.2 개인정보보호법 (PIPA) 준수 — 한국
이 서비스는 **고객의 개인정보(이름, 전화번호, 이메일, 주소)** 를 저장·처리하므로 개인정보보호법 적용 대상.

| 의무사항 | 이행 방법 |
|----------|----------|
| 개인정보 처리방침 공개 | 푸터에 처리방침 페이지 링크 필수 |
| 수집 목적 명시 | "디지털 명함 서비스 제공 목적" 명시 |
| 최소 수집 원칙 | 명함에 필요한 정보만 수집 (민감정보 수집 금지) |
| 보관 기간 명시 | 서비스 해지 후 즉시 삭제 또는 X개월 후 삭제 |
| 제3자 제공 금지 | Supabase(미국 서버) 이용 고지 필요 — 국외 이전 동의 |
| 안전조치 의무 | DB 접근 제한, 전송 구간 암호화(HTTPS), 접근 로그 |
| 고객 권리 보장 | 관리자에게 삭제 요청 가능하도록 연락처 명시 |

> ⚠️ **Supabase 서버 위치:** 기본값 미국(AWS). 국외 개인정보 이전에 해당 → 처리방침에 명시 필수. 필요 시 Supabase 한국/아시아 리전 선택 가능.

### 8.3 처리방침 페이지 (필수)
- `/privacy` 페이지 생성 필수
- 수집 항목, 목적, 보유기간, 제3자 제공(없음), 국외이전(Supabase), 담당자 연락처 포함

## 10. 추가 기능 (MVP 이후)

- PWA (홈 화면 추가)
- 고객 직접 편집 모드 (고객에게 편집 링크 발급)
- 링크 클릭 통계
- 다국어 지원

---

## 11. 프로젝트 구조 (예상)

```
C:/BIZWEB/
├── app/
│   ├── [slug]/          # 고객 명함 페이지 (ISR)
│   │   └── page.tsx
│   ├── admin/           # 관리자 대시보드
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/
│       ├── revalidate/
│       ├── admin/
│       └── views/
├── components/
│   ├── card/            # 명함 페이지 컴포넌트
│   └── admin/           # 관리자 UI 컴포넌트
├── lib/
│   └── supabase.ts
└── docs/
    └── superpowers/specs/
```
