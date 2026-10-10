import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch every filled notebook in cover-number order, each with its number of entries. */
export async function getFilledNotebooks(
  client: SupabaseClient<LaundromatDatabase>
) {
  const { data, error } = await client
    .from("notebooks")
    .select("number, started_at, filled_at, notebook_entries(count)")
    .not("filled_at", "is", null)
    .order("number");

  if (error) {
    throw error;
  }

  return data.flatMap((notebook) =>
    notebook.filled_at === null
      ? []
      : [
          {
            number: notebook.number,
            startedAt: notebook.started_at,
            filledAt: notebook.filled_at,
            entryCount: notebook.notebook_entries.at(0)?.count ?? 0,
          },
        ]
  );
}
