import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch the saved translations into `locale` of the notes in `noteIds`; notes never translated into `locale` are left out. */
export async function getBookNoteTranslations(options: {
  client: SupabaseClient<LaundromatDatabase>;
  noteIds: number[];
  locale: string;
}) {
  const { data, error } = await options.client
    .from("book_note_translations")
    .select("note_id, body, source_language")
    .eq("locale", options.locale)
    .in("note_id", options.noteIds);
  if (error) throw error;
  return data;
}
