import { getSupabase } from '@/lib/supabase';
import { fetchPatchNotes } from '@/lib/scrapers/fandom';

export async function GET() {
  try {
    const patches = await fetchPatchNotes();
    let synced = 0;

    for (const p of patches) {
      const { data: existing } = await getSupabase()
        .from('patch_notes')
        .select('id')
        .eq('version', p.version)
        .maybeSingle();

      if (existing) {
        await getSupabase().from('patch_notes').update({
          title: p.title,
          content_html: p.content_html,
          source_page: p.source_page,
        }).eq('id', existing.id);
      } else {
        await getSupabase().from('patch_notes').insert(p);
      }
      synced++;
    }

    return Response.json({ ok: true, synced });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
