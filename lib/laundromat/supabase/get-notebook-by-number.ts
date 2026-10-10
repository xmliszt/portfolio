import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

type GetNotebookByNumberOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  number: number;
};

/** Fetch the notebook with cover number `number`, or `null` when there is none. */
export async function getNotebookByNumber(options: GetNotebookByNumberOptions) {
  const { data, error } = await options.client
    .from("notebooks")
    .select("*")
    .eq("number", options.number)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
