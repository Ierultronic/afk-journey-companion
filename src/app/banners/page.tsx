import { getSupabase } from "@/lib/supabase";
import BannerCard from "@/components/BannerCard";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const { data: banners } = await getSupabase()
    .from("banners")
    .select("*")
    .order("start_date", { ascending: false });

  const active = banners?.filter(b => b.is_active) || [];
  const past = banners?.filter(b => !b.is_active) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Banner Tracker</h1>

      {active.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Active Banners</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(b => <BannerCard key={b.id} {...b} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Past Banners</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.slice(0, 20).map(b => <BannerCard key={b.id} {...b} />)}
          </div>
        </div>
      )}

      {(!banners || banners.length === 0) && (
        <p className="text-gray-500">No banner data yet. Run the sync-banners cron job.</p>
      )}
    </div>
  );
}
