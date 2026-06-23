import { getSupabase } from "@/lib/supabase";
import TeamSlot from "@/components/TeamSlot";

export const dynamic = "force-dynamic";

export default async function TeamBuilderPage() {
  const { data: heroes } = await getSupabase().from("heroes").select("name,faction,class,rarity,icon_url").order("name");
  const { data: tiers } = await getSupabase().from("tier_ratings").select("*");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Team Builder</h1>
      <p className="text-sm text-gray-400">
        Pick the heroes you own, select a game mode, and get an instant recommended team based on the meta tier list.
      </p>
      <TeamSlot heroes={heroes || []} tiers={tiers || []} />
    </div>
  );
}
