import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch the saved translations into `locale` of the entries in `entryIds`; entries never translated into `locale` are left out. */
export async function getEntryTranslations(options: {
  client: SupabaseClient<LaundromatDatabase>;
  entryIds: number[];
  locale: string;
}) {
  const { data, error } = await options.client
    .from("entry_translations")
    .select("entry_id, body, source_language")
    .eq("locale", options.locale)
    .in("entry_id", options.entryIds);
  if (error) throw error;
  return data;
}
