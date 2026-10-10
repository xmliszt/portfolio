import { SupabaseClient } from "@supabase/supabase-js";

import {
  LaundromatDatabase,
  Notebook,
} from "@/lib/laundromat/supabase/notebook-types";

type GetNotebookEntriesOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  notebook: Pick<Notebook, "id" | "lines_per_page">;
  fromPage: number;
  toPage: number;
};

/**
 * Fetch the visible entries with at least one line on pages `fromPage` to `toPage`, in writing order.
 */
export async function getNotebookEntries(options: GetNotebookEntriesOptions) {
  const linesPerPage = options.notebook.lines_per_page;
  const pagesAnEntryCanSpan = 3;

  const { data, error } = await options.client
    .from("notebook_entries")
    .select("*")
    .eq("notebook_id", options.notebook.id)
    .gte("page", options.fromPage - (pagesAnEntryCanSpan - 1))
    .lte("page", options.toPage)
    .order("page")
    .order("line_start");

  if (error) {
    throw error;
  }

  const firstLine = (options.fromPage - 1) * linesPerPage;

  return data.filter(
    (entry) =>
      (entry.page - 1) * linesPerPage +
        entry.line_start -
        1 +
        entry.line_count >
      firstLine
  );
}
