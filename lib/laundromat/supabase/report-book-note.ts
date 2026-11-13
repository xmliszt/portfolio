import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Record a report of book note `noteId` by a visitor, ignoring repeat reports of the same note by the same visitor. */
export async function reportBookNote(options: {
  client: SupabaseClient<LaundromatDatabase>;
  noteId: number;
  visitorId: string;
  reason: string | undefined;
}) {
  const { error } = await options.client.from("book_note_reports").upsert(
    {
      note_id: options.noteId,
      visitor_id: options.visitorId,
      reason: options.reason ?? null,
    },
    { onConflict: "note_id,visitor_id", ignoreDuplicates: true }
  );
  if (error) throw error;
}
