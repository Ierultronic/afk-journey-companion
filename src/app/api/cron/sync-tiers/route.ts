import { getSupabase } from '@/lib/supabase';
import { scrapeTierList } from '@/lib/scrapers/prydwen';

export async function GET() {
  try {
    const tiers = await scrapeTierList();
    if (tiers.length === 0) {
      return Response.json({ ok: false, error: 'no tiers scraped' }, { status: 502 });
    }

    await getSupabase().from('tier_ratings').delete().neq('id', 0);
    await getSupabase().from('tier_ratings').insert(tiers);

    return Response.json({ ok: true, synced: tiers.length });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
