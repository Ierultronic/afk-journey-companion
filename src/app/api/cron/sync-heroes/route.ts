import { getSupabase } from '@/lib/supabase';
import { getAllHeroNames, getHeroWikitext, parseHeroInfobox, parseHeroSkills, fetchHeroImageUrl } from '@/lib/scrapers/fandom';
import { NextRequest } from 'next/server';

async function processHero(name: string) {
  const [wt, imgUrl] = await Promise.all([
    getHeroWikitext(name),
    fetchHeroImageUrl(name),
  ]);
  const info = parseHeroInfobox(wt);
  if (!info) return;

  const { data: existing } = await getSupabase()
    .from('heroes')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    await getSupabase().from('heroes').update({
      faction: info.faction, class: info.class, rarity: info.rarity,
      damage_type: info.damage_type, range: info.range,
      icon_url: imgUrl, wiki_page: name, synced_at: new Date().toISOString(),
    }).eq('id', existing.id);
  } else {
    await getSupabase().from('heroes').insert({
      name, faction: info.faction, class: info.class, rarity: info.rarity,
      damage_type: info.damage_type, range: info.range,
      icon_url: imgUrl, wiki_page: name,
    });
  }

  const skills = parseHeroSkills(wt);
  if (skills.length > 0) {
    const dbId = existing?.id || (await getSupabase().from('heroes').select('id').eq('name', name).single()).data?.id;
    if (dbId) {
      await getSupabase().from('hero_skills').delete().eq('hero_id', dbId);
      await getSupabase().from('hero_skills').insert(
        skills.map(s => ({ hero_id: dbId, name: s.name, description: s.description, unlock_level: s.unlock_level }))
      );
    }
  }
}

const CONCURRENCY = 5;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const names = await getAllHeroNames();
    const batch = names.slice(offset, offset + 20);

    if (batch.length === 0) {
      return Response.json({ ok: true, synced: 0, total: names.length, done: true });
    }

    let synced = 0;
    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const chunk = batch.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map(async (name) => {
        try {
          await processHero(name);
          synced++;
        } catch (e) {
          console.error(`Failed to sync ${name}:`, e);
        }
      }));
    }

    const nextOffset = offset + batch.length;
    return Response.json({
      ok: true,
      synced,
      total: names.length,
      offset: nextOffset,
      remaining: names.length - nextOffset,
      done: nextOffset >= names.length,
      nextUrl: nextOffset < names.length ? `/api/cron/sync-heroes?offset=${nextOffset}` : null,
    });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
