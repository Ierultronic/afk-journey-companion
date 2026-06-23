export interface Hero {
  id: number;
  name: string;
  faction: string;
  class: string;
  rarity: string;
  damage_type: string | null;
  range: string | null;
  icon_url: string | null;
  portrait_url: string | null;
  wiki_page: string | null;
  synced_at: string;
}

export interface HeroSkill {
  id: number;
  hero_id: number;
  name: string;
  description: string | null;
  skill_type: string | null;
  unlock_level: number | null;
}

export interface Banner {
  id: number;
  hero_name: string;
  banner_type: string;
  start_date: string | null;
  end_date: string | null;
  source_page: string | null;
  is_active: boolean;
  synced_at: string;
}

export interface GameEvent {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  event_type: string | null;
  season: string | null;
  source_page: string | null;
  synced_at: string;
}

export interface TierRating {
  id: number;
  hero_name: string;
  mode: 'afk_stages' | 'dream_realm' | 'dream_realm_endless' | 'pvp';
  tier: 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C';
  patch_version: string | null;
  scraped_at: string;
}

export interface PatchNote {
  id: number;
  version: string;
  title: string | null;
  content_html: string | null;
  released_at: string | null;
  source_page: string | null;
  synced_at: string;
}

export interface TeamComp {
  id: number;
  name: string;
  mode: string;
  hero_names: string[];
  description: string | null;
  source_url: string | null;
  scraped_at: string;
}

export type GameMode = 'afk_stages' | 'dream_realm' | 'dream_realm_endless' | 'pvp';
