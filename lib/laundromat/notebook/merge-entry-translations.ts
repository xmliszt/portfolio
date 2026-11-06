/** Return the `saved` rows and the `fresh` translations as one list, keeping only entries whose id is in `visibleIds`; a saved `null` body becomes `undefined`. */
export function mergeEntryTranslations(options: {
  visibleIds: number[];
  saved: {
    entry_id: number;
    body: string | null;
    source_language: string;
  }[];
  fresh: {
    entryId: number;
    body: string | undefined;
    sourceLanguage: string;
  }[];
}) {
  return [
    ...options.saved.map((row) => ({
      entryId: row.entry_id,
      body: row.body ?? undefined,
      sourceLanguage: row.source_language,
    })),
    ...options.fresh,
  ].filter((translation) => options.visibleIds.includes(translation.entryId));
}
