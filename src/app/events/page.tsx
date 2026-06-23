import { getSupabase } from "@/lib/supabase";
import EventTimeline from "@/components/EventTimeline";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const { data: events } = await getSupabase().from("events").select("*").order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Events</h1>
      <EventTimeline events={events || []} />
    </div>
  );
}
