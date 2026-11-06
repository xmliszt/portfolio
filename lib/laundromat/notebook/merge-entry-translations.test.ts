import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeEntryTranslations } from "./merge-entry-translations";

test("returns saved and fresh translations together, a saved null body as undefined", () => {
  assert.deepEqual(
    mergeEntryTranslations({
      visibleIds: [1, 2, 3],
      saved: [
        { entry_id: 1, body: "hello", source_language: "ja" },
        { entry_id: 2, body: null, source_language: "en" },
      ],
      fresh: [{ entryId: 3, body: "rain", sourceLanguage: "bn" }],
    }),
    [
      { entryId: 1, body: "hello", sourceLanguage: "ja" },
      { entryId: 2, body: undefined, sourceLanguage: "en" },
      { entryId: 3, body: "rain", sourceLanguage: "bn" },
    ]
  );
});

test("leaves out a hidden entry even when a translation of it was saved", () => {
  assert.deepEqual(
    mergeEntryTranslations({
      visibleIds: [2],
      saved: [{ entry_id: 1, body: "hidden words", source_language: "en" }],
      fresh: [],
    }),
    []
  );
});
