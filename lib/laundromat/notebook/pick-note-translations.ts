/** Return one result per entry of `translations` whose `id` is in `notes`, with `body` set to `undefined` when the note is already in the target language or its translation is empty or identical to the note. */
export function pickNoteTranslations(options: {
  notes: { id: number; body: string }[];
  translations: {
    id: number;
    sourceLanguage: string;
    isTargetLanguage: boolean;
    translation: string;
  }[];
}) {
  return options.translations.flatMap((translation) => {
    const note = options.notes.find((each) => each.id === translation.id);
    if (note === undefined) return [];
    const text = translation.translation.trim();
    const isUnchanged = text === "" || text === note.body.trim();
    return [
      {
        entryId: translation.id,
        body: translation.isTargetLanguage || isUnchanged ? undefined : text,
        sourceLanguage: translation.sourceLanguage,
      },
    ];
  });
}
