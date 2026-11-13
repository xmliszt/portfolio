import { SupabaseClient } from "@supabase/supabase-js";
import uniq from "lodash/uniq.js";

import type { CatalogueSource } from "@/lib/laundromat/bookshelf/catalogue-book";
import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch the shelf books, visible or not, that came from the catalogue records in `records`. */
export async function findBooksBySourceIds(options: {
  client: SupabaseClient<LaundromatDatabase>;
  records: { source: CatalogueSource; sourceId: string }[];
}) {
  if (options.records.length === 0) return [];
  const { data, error } = await options.client
    .from("books")
    .select("id, source, source_id, vote_count, visible_note_count")
    .in("source", uniq(options.records.map((record) => record.source)))
    .in(
      "source_id",
      options.records.map((record) => record.sourceId)
    );
  if (error) throw error;
  return data.filter((row) =>
    options.records.some(
      (record) =>
        record.source === row.source && record.sourceId === row.source_id
    )
  );
}
