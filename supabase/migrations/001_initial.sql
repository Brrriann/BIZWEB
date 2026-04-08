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

-- RLS 활성화
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

-- page_views 공개 삽입
CREATE POLICY "public_insert_views" ON page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_views" ON page_views
  FOR SELECT USING (true);
