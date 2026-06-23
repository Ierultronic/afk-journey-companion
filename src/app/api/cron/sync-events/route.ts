import { getSupabase } from '@/lib/supabase';
import { fetchAllEvents } from '@/lib/scrapers/fandom';

export async function GET() {
  try {
    const events = await fetchAllEvents();

    const { error: delErr } = await getSupabase().from('events').delete().neq('id', 0);
    if (delErr) return Response.json({ ok: false, error: delErr.message }, { status: 500 });

    for (let i = 0; i < events.length; i += 20) {
      const chunk = events.slice(i, i + 20);
      const { error: insErr } = await getSupabase().from('events').insert(
        chunk.map(e => ({
          name: e.name,
          description: e.description,
          start_date: e.start_date,
          end_date: e.end_date,
          event_type: e.event_type,
          source_page: e.source_page,
        }))
      );
      if (insErr) console.error('Insert error:', insErr);
    }

    return Response.json({ ok: true, synced: events.length });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
