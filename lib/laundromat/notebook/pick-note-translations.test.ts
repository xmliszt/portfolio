import assert from "node:assert/strict";
import { test } from "node:test";

import { pickNoteTranslations } from "./pick-note-translations";

test("keeps a real translation as its body", () => {
  assert.deepEqual(
    pickNoteTranslations({
      notes: [{ id: 1, body: "今日はいい天気" }],
      translations: [
        {
          id: 1,
          sourceLanguage: "ja",
          isTargetLanguage: false,
          translation: " It's nice weather today ",
        },
      ],
    }),
    [{ entryId: 1, body: "It's nice weather today", sourceLanguage: "ja" }]
  );
});

test("saves a note already in the target language or echoed back without a body", () => {
  assert.deepEqual(
    pickNoteTranslations({
      notes: [
        { id: 1, body: "hello" },
        { id: 2, body: "Paris" },
        { id: 3, body: "😊" },
      ],
      translations: [
        {
          id: 1,
          sourceLanguage: "en",
          isTargetLanguage: true,
          translation: "",
        },
        {
          id: 2,
          sourceLanguage: "fr",
          isTargetLanguage: false,
          translation: "Paris",
        },
        {
          id: 3,
          sourceLanguage: "und",
          isTargetLanguage: false,
          translation: "",
        },
      ],
    }),
    [
      { entryId: 1, body: undefined, sourceLanguage: "en" },
      { entryId: 2, body: undefined, sourceLanguage: "fr" },
      { entryId: 3, body: undefined, sourceLanguage: "und" },
    ]
  );
});

test("drops answers for ids that were not asked for", () => {
  assert.deepEqual(
    pickNoteTranslations({
      notes: [{ id: 1, body: "hola" }],
      translations: [
        {
          id: 9,
          sourceLanguage: "es",
          isTargetLanguage: false,
          translation: "hi",
        },
      ],
    }),
    []
  );
});
