import { getSupabase } from "@/lib/supabase";
import HeroesClient from "./HeroesClient";

export const dynamic = "force-dynamic";

export default async function HeroesPage() {
  const { data: heroes } = await getSupabase()
    .from("heroes")
    .select("*")
    .order("name");

  if (!heroes || heroes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Hero Database</h1>
        <p className="text-gray-500">No heroes synced yet. Check back after the next data sync.</p>
      </div>
    );
  }

  return <HeroesClient heroes={heroes} />;
}
