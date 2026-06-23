import { getSupabase } from '@/lib/supabase';
import { fetchAllBanners } from '@/lib/scrapers/fandom';
import { parseFandomDate } from '@/lib/scrapers/parsers';

export async function GET() {
  try {
    const banners = await fetchAllBanners();

    await getSupabase().from('banners').delete().neq('id', 0);
    await getSupabase().from('banners').insert(
      banners.map(b => ({
        ...b,
        start_date: parseFandomDate(b.start_date),
        end_date: parseFandomDate(b.end_date),
        is_active: b.end_date ? new Date(b.end_date) > new Date() : true,
      }))
    );

    return Response.json({ ok: true, synced: banners.length });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
