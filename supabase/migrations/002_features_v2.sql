-- Phase 0: v2 features migration

-- 1. 다국어 지원
ALTER TABLE cards ADD COLUMN IF NOT EXISTS supported_languages text[] NOT NULL DEFAULT '{ko}';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
-- translations structure: { "en": { "name":"...", "title":"...", "bio":"...", "address":"..." }, "ja": {...} }

-- 2. 실시간 상태표시
ALTER TABLE cards ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'online';
-- values: 'online' | 'busy' | 'meeting' | 'offline'
ALTER TABLE cards ADD COLUMN IF NOT EXISTS status_pin text;
-- stored as SHA-256 hex hash (null = no PIN set, public can change freely)

-- 3. 인트로 모션그래픽
ALTER TABLE cards ADD COLUMN IF NOT EXISTS intro_animation text;
-- values: 'fade' | 'slide' | 'typewriter' | 'particles' | 'wave' | null (no animation)

-- 4. QR명함 신청버튼 표시 여부
ALTER TABLE cards ADD COLUMN IF NOT EXISTS show_qr_card_cta boolean NOT NULL DEFAULT true;

-- Add comment explaining status values
COMMENT ON COLUMN cards.status IS 'online | busy | meeting | offline';
COMMENT ON COLUMN cards.translations IS 'JSON: { "en": { "name", "title", "bio", "address" }, "ja": {...} }';
