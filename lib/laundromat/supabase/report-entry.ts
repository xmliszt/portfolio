import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

type ReportEntryOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  entryId: number;
  visitorId: string;
  reason: string | undefined;
};

/**
 * Record a report of an entry by a visitor, ignoring repeat reports of the same entry by the same visitor.
 */
export async function reportEntry(options: ReportEntryOptions) {
  const { error } = await options.client.from("entry_reports").upsert(
    {
      entry_id: options.entryId,
      visitor_id: options.visitorId,
      reason: options.reason?.trim() || null,
    },
    { onConflict: "entry_id,visitor_id", ignoreDuplicates: true }
  );

  if (error) {
    throw error;
  }
}
