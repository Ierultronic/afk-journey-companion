import { getAllHeroNames, getHeroWikitext, parseHeroInfobox, parseHeroSkills, fetchHeroImageUrl, fetchAllBanners, fetchAllEvents, fetchPatchNotes } from '@/lib/scrapers/fandom';
import { scrapeTierList, scrapeTeamComps } from '@/lib/scrapers/prydwen';
import { getSupabase } from '@/lib/supabase';
import { parseFandomDate } from '@/lib/scrapers/parsers';

const CONCURRENCY = 5;

async function syncHeroes() {
  const names = await getAllHeroNames();
  let synced = 0;
  for (let i = 0; i < names.length; i += 20) {
    const batch = names.slice(i, i + 20);
    await Promise.all(batch.map(async (name) => {
      try {
        const [wt, imgUrl] = await Promise.all([
          getHeroWikitext(name),
          fetchHeroImageUrl(name),
        ]);
        const info = parseHeroInfobox(wt);
        if (!info) return;
        const { data: existing } = await getSupabase().from('heroes').select('id').eq('name', name).maybeSingle();
        if (existing) {
          await getSupabase().from('heroes').update({ faction: info.faction, class: info.class, rarity: info.rarity, damage_type: info.damage_type, range: info.range, icon_url: imgUrl, wiki_page: name, synced_at: new Date().toISOString() }).eq('id', existing.id);
        } else {
          await getSupabase().from('heroes').insert({ name, faction: info.faction, class: info.class, rarity: info.rarity, damage_type: info.damage_type, range: info.range, icon_url: imgUrl, wiki_page: name });
        }
        const skills = parseHeroSkills(wt);
        if (skills.length > 0) {
          const dbId = existing?.id || (await getSupabase().from('heroes').select('id').eq('name', name).single()).data?.id;
          if (dbId) {
            await getSupabase().from('hero_skills').delete().eq('hero_id', dbId);
            await getSupabase().from('hero_skills').insert(skills.map(s => ({ hero_id: dbId, name: s.name, description: s.description, unlock_level: s.unlock_level })));
          }
        }
        synced++;
      } catch (e) {
        console.error(`hero ${name}:`, e);
      }
    }));
  }
  return { heroes: synced };
}

async function syncBanners() {
  const banners = await fetchAllBanners();
  await getSupabase().from('banners').delete().neq('id', 0);
  for (let i = 0; i < banners.length; i += 20) {
    await getSupabase().from('banners').insert(banners.slice(i, i + 20).map(b => ({
      ...b, start_date: parseFandomDate(b.start_date), end_date: parseFandomDate(b.end_date),
      is_active: b.end_date ? new Date(b.end_date) > new Date() : true,
    })));
  }
  return { banners: banners.length };
}

async function syncEvents() {
  const events = await fetchAllEvents();
  await getSupabase().from('events').delete().neq('id', 0);
  for (let i = 0; i < events.length; i += 20) {
    await getSupabase().from('events').insert(events.slice(i, i + 20));
  }
  return { events: events.length };
}

async function syncTiers() {
  const tiers = await scrapeTierList();
  if (tiers.length > 0) {
    await getSupabase().from('tier_ratings').delete().neq('id', 0);
    for (let i = 0; i < tiers.length; i += 50) {
      await getSupabase().from('tier_ratings').insert(tiers.slice(i, i + 50));
    }
  }
  return { tiers: tiers.length };
}

async function syncPatches() {
  const patches = await fetchPatchNotes();
  let synced = 0;
  for (const p of patches) {
    const { data: existing } = await getSupabase().from('patch_notes').select('id').eq('version', p.version).maybeSingle();
    if (existing) {
      await getSupabase().from('patch_notes').update({ title: p.title, content_html: p.content_html, source_page: p.source_page }).eq('id', existing.id);
    } else {
      await getSupabase().from('patch_notes').insert(p);
    }
    synced++;
  }
  return { patches: synced };
}

async function syncTeams() {
  const comps = await scrapeTeamComps();
  if (comps.length > 0) {
    await getSupabase().from('team_comps').delete().neq('id', 0);
    for (let i = 0; i < comps.length; i += 20) {
      await getSupabase().from('team_comps').insert(comps.slice(i, i + 20));
    }
  }
  return { teams: comps.length };
}

export async function GET() {
  try {
    const start = Date.now();
    const results = {
      ...(await syncHeroes()),
      ...(await syncBanners()),
      ...(await syncEvents()),
      ...(await syncTiers()),
      ...(await syncPatches()),
      ...(await syncTeams()),
      time_ms: Date.now() - start,
    };
    return Response.json({ ok: true, ...results });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
