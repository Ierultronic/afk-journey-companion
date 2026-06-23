import { getSupabase } from "@/lib/supabase";
import TierGrid from "@/components/TierGrid";

export const dynamic = "force-dynamic";

export default async function TierListPage() {
  const { data: tiers } = await getSupabase().from("tier_ratings").select("*").order("hero_name");

  const grouped: Record<string, { hero_name: string; tier: string }[]> = {};
  for (const t of tiers || []) {
    (grouped[t.mode] ||= []).push(t);
  }

  const modeLabels: Record<string, string> = {
    afk_stages: "AFK Stages",
    dream_realm: "Dream Realm",
    dream_realm_endless: "Dream Realm (Endless)",
    pvp: "PvP",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Tier List</h1>
      {Object.entries(modeLabels).map(([key, label]) => (
        <TierGrid key={key} tiers={grouped[key] || []} title={label} />
      ))}
      {(!tiers || tiers.length === 0) && (
        <p className="text-gray-500">No tier data yet. Run the sync-tiers cron job.</p>
      )}
    </div>
  );
}
