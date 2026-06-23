import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HeroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  const { data: hero } = await getSupabase().from("heroes").select("*").eq("name", name).single();
  if (!hero) notFound();

  const { data: skills } = await getSupabase().from("hero_skills").select("*").eq("hero_id", hero.id).order("unlock_level");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-6">
        {hero.icon_url && (
          <img src={hero.icon_url} alt={hero.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">{hero.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">{hero.rarity}</span>
            <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">{hero.class}</span>
            <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">{hero.faction}</span>
            {hero.damage_type && (
              <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">{hero.damage_type}</span>
            )}
            {hero.range && (
              <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">Range {hero.range}</span>
            )}
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
