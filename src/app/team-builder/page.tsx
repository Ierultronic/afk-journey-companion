import { getSupabase } from "@/lib/supabase";
import TeamSlot from "@/components/TeamSlot";

export const dynamic = "force-dynamic";

export default async function TeamBuilderPage() {
  const { data: comps } = await getSupabase().from("team_comps").select("*").order("name");
  const { data: heroes } = await getSupabase().from("heroes").select("name").order("name");
  const availableHeroes = heroes?.map(h => h.name) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Team Builder</h1>
      <p className="text-sm text-gray-400">
        Pick heroes to see matching meta team compositions. Filter by game mode.
      </p>
      <TeamSlot comps={comps || []} availableHeroes={availableHeroes} />
    </div>
  );
}
