CREATE TABLE heroes (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  faction TEXT NOT NULL,
  class TEXT NOT NULL,
  rarity TEXT NOT NULL,
  damage_type TEXT,
  range TEXT,
  icon_url TEXT,
  portrait_url TEXT,
  wiki_page TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hero_skills (
  id SERIAL PRIMARY KEY,
  hero_id INT REFERENCES heroes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  skill_type TEXT,
  unlock_level INT,
  UNIQUE(hero_id, name)
);

CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  hero_name TEXT NOT NULL,
  banner_type TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  source_page TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  event_type TEXT,
  season TEXT,
  source_page TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tier_ratings (
  id SERIAL PRIMARY KEY,
  hero_name TEXT NOT NULL,
  mode TEXT NOT NULL,
  tier TEXT NOT NULL,
  patch_version TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE patch_notes (
  id SERIAL PRIMARY KEY,
  version TEXT UNIQUE NOT NULL,
  title TEXT,
  content_html TEXT,
  released_at TIMESTAMPTZ,
  source_page TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_comps (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mode TEXT NOT NULL,
  hero_names TEXT[] NOT NULL,
  description TEXT,
  source_url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_heroes_faction ON heroes(faction);
CREATE INDEX idx_heroes_class ON heroes(class);
CREATE INDEX idx_tier_ratings_mode ON tier_ratings(mode);
CREATE INDEX idx_tier_ratings_hero ON tier_ratings(hero_name);
CREATE INDEX idx_banners_active ON banners(is_active);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
