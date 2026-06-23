# AFK Journey Companion

Personal project — automated hero database, meta tier lists, team builder, banner tracker, and event calendar for AFK Journey (Global).

> **Disclaimer:** This is a personal hobby project. Not affiliated with Lilith Games, Farlight Games, or any related entities. All game data sourced from public community wikis and guide sites.

🔗 **Live demo:** [afk-journey-companion.onrender.com](https://afk-journey-companion.onrender.com)

## Stack

- **Next.js 16** (App Router)
- **Supabase** (PostgreSQL)
- **Tailwind CSS**
- **Docker**

## Data Sources (auto-synced via cron)

| Source | Data | Method |
|--------|------|--------|
| [Fandom Wiki](https://afk-journey.fandom.com) | Heroes, skills, banners, events, patch notes | MediaWiki API |
| [Gamer Choice](https://gamer-choice.com/afk-journey-tier-list/) | Tier rankings by mode | HTML scrape |

## Quick Start

```bash
# 1. Create a free Supabase project → paste schema from supabase/migrations/001_initial.sql
# 2. Set env vars
cp .env.example .env.local
# Edit .env.local with your SUPABASE_URL and SUPABASE_SERVICE_KEY

# 3. Install & run
npm install
npm run dev

# 4. Seed data
curl http://localhost:3000/api/cron/sync-all
```

## Deploy

See `render.yaml` for Render Blueprint config. Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` as environment variables.

## License

MIT
