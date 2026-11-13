import uniqBy from "lodash/uniqBy.js";
import { z } from "zod";

import { BOOK_TEXT_LIMITS } from "./book-text-limits";
import type { CatalogueBook } from "./catalogue-book";
import { clipText } from "./clip-text";

const OPEN_LIBRARY_RESPONSE = z.object({ docs: z.array(z.unknown()) });

const OPEN_LIBRARY_DOC = z.object({
  key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  author_name: z.array(z.string()).optional(),
  first_publish_year: z.number().int().optional(),
  cover_i: z.number().int().positive().optional(),
});

const WORK_KEY = /^\/works\/(OL\d{1,12}W)$/;

/** Return the books in an Open Library `search.json` response, skipping any doc that is malformed or has no work id, title or author; `language` is always `undefined`. */
export function parseOpenLibraryResults(json: unknown): CatalogueBook[] {
  const parsed = OPEN_LIBRARY_RESPONSE.safeParse(json);
  if (!parsed.success) return [];
  return parsed.data.docs.flatMap((raw) => {
    const doc = OPEN_LIBRARY_DOC.safeParse(raw);
    if (!doc.success) return [];
    const { data } = doc;
    const sourceId = WORK_KEY.exec(data.key)?.at(1);
    const title = clipText({
      text: data.title,
      maxChars: BOOK_TEXT_LIMITS.title,
    });
    const authors = clipText({
      text: uniqBy(data.author_name ?? [], (name) => name.toLowerCase())
        .slice(0, 3)
        .join(", "),
      maxChars: BOOK_TEXT_LIMITS.authors,
    });
    if (
      sourceId === undefined ||
      title === undefined ||
      authors === undefined
    ) {
      return [];
    }
    return [
      {
        source: "openlibrary",
        sourceId,
        title,
        subtitle: clipText({
          text: data.subtitle,
          maxChars: BOOK_TEXT_LIMITS.subtitle,
        }),
        authors,
        year: data.first_publish_year,
        // the search lists the languages of every edition, not the book's own
        language: undefined,
        coverRef: data.cover_i === undefined ? undefined : String(data.cover_i),
      } satisfies CatalogueBook,
    ];
  });
}
