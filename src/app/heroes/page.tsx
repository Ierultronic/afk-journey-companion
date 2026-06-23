import { getSupabase } from "@/lib/supabase";
import HeroCard from "@/components/HeroCard";

export const dynamic = "force-dynamic";

export default async function HeroesPage() {
  const { data: heroes } = await getSupabase()
    .from("heroes")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Hero Database</h1>
      <p className="text-sm text-gray-400">{heroes?.length || 0} heroes synced from Fandom Wiki</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {heroes?.map(h => (
          <HeroCard key={h.id} name={h.name} faction={h.faction} class={h.class} rarity={h.rarity} icon_url={h.icon_url} />
        ))}
        {(!heroes || heroes.length === 0) && (
          <p className="text-gray-500 col-span-full">No heroes yet. Run the sync-heroes cron job or seed the database.</p>
        )}
      </div>
    </div>
  );
}
