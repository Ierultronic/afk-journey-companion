import { getSupabase } from "@/lib/supabase";
import PatchNotesClient from "./PatchNotesClient";

export const dynamic = "force-dynamic";

export default async function PatchNotesPage() {
  const { data: patches } = await getSupabase()
    .from("patch_notes")
    .select("*")
    .order("version", { ascending: false });

  return <PatchNotesClient patches={patches || []} />;
}
