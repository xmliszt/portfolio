import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Save `translations` into `locale`, keeping any translation of the same entry and locale that is already saved. */
export async function saveEntryTranslations(options: {
  client: SupabaseClient<LaundromatDatabase>;
  locale: string;
  translations: {
    entryId: number;
    body: string | undefined;
    sourceLanguage: string;
  }[];
}) {
  if (options.translations.length === 0) return;
  const { error } = await options.client.from("entry_translations").upsert(
    options.translations.map((translation) => ({
      entry_id: translation.entryId,
      locale: options.locale,
      body: translation.body ?? null,
      source_language: translation.sourceLanguage,
    })),
    { onConflict: "entry_id,locale", ignoreDuplicates: true }
  );
  if (error) throw error;
}
