import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { FACTION_BG_LIGHT } from "@/lib/colors";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HeroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  const { data: hero } = await getSupabase().from("heroes").select("*").eq("name", name).single();
  if (!hero) notFound();

  const { data: skills } = await getSupabase().from("hero_skills").select("*").eq("hero_id", hero.id).order("unlock_level");

  const badge = (label: string, cls = "bg-gray-700 text-gray-200") =>
    <span className={`text-xs px-2 py-1 rounded border ${cls}`}>{label}</span>;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/heroes" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
        ← Back to heroes
      </Link>

      <div className="flex items-start gap-6">
        {hero.icon_url && (
          <img src={hero.icon_url} alt={hero.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">{hero.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            {badge(hero.rarity)}
            {badge(hero.class)}
            {badge(hero.faction, FACTION_BG_LIGHT[hero.faction] || 'bg-gray-700 text-gray-200 border-gray-600')}
            {hero.damage_type && badge(hero.damage_type)}
            {hero.range && badge(`Range ${hero.range}`)}
          </div>
        </div>
      </div>

      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Skills</h2>
          <div className="space-y-3">
            {skills.map(s => (
              <div key={s.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className="text-xs text-gray-400">Lv. {s.unlock_level}</span>
                </div>
                {s.description && <p className="text-sm text-gray-300">{s.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {hero.wiki_page && (
        <a
          href={`https://afk-journey.fandom.com/wiki/${encodeURIComponent(hero.wiki_page)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-indigo-400 hover:text-indigo-300"
        >
          View on Fandom Wiki →
        </a>
      )}
    </div>
  );
}
