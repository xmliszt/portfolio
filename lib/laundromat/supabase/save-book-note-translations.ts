import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Save `translations` into `locale`, keeping any translation of the same note and locale that is already saved. */
export async function saveBookNoteTranslations(options: {
  client: SupabaseClient<LaundromatDatabase>;
  locale: string;
  translations: {
    entryId: number;
    body: string | undefined;
    sourceLanguage: string;
  }[];
}) {
  if (options.translations.length === 0) return;
  const { error } = await options.client.from("book_note_translations").upsert(
    options.translations.map((translation) => ({
      note_id: translation.entryId,
      locale: options.locale,
      body: translation.body ?? null,
      source_language: translation.sourceLanguage,
    })),
    { onConflict: "note_id,locale", ignoreDuplicates: true }
  );
  if (error) throw error;
}
