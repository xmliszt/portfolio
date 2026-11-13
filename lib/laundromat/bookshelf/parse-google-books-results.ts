import uniqBy from "lodash/uniqBy.js";
import { z } from "zod";

import { BOOK_TEXT_LIMITS } from "./book-text-limits";
import type { CatalogueBook } from "./catalogue-book";
import { clipText } from "./clip-text";

const GOOGLE_BOOKS_RESPONSE = z.object({
  items: z.array(z.unknown()).optional(),
});

const GOOGLE_BOOKS_ITEM = z.object({
  id: z.string(),
  volumeInfo: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()).optional(),
    publishedDate: z.string().optional(),
    language: z.string().optional(),
    imageLinks: z.object({ thumbnail: z.string() }).partial().optional(),
  }),
});

const VOLUME_ID = /^[A-Za-z0-9_-]{8,16}$/;

/** Return the books in a Google Books `volumes` response, skipping any item that is malformed or has no valid volume id, title or author. */
export function parseGoogleBooksResults(json: unknown): CatalogueBook[] {
  const parsed = GOOGLE_BOOKS_RESPONSE.safeParse(json);
  if (!parsed.success) return [];
  return (parsed.data.items ?? []).flatMap((raw) => {
    const item = GOOGLE_BOOKS_ITEM.safeParse(raw);
    if (!item.success) return [];
    const { id, volumeInfo: info } = item.data;
    const title = clipText({
      text: info.title,
      maxChars: BOOK_TEXT_LIMITS.title,
    });
    const authors = clipText({
      text: uniqBy(info.authors ?? [], (name) => name.toLowerCase())
        .slice(0, 3)
        .join(", "),
      maxChars: BOOK_TEXT_LIMITS.authors,
    });
    if (!VOLUME_ID.test(id) || title === undefined || authors === undefined) {
      return [];
    }
    const year = /^(\d{4})/.exec(info.publishedDate ?? "")?.at(1);
    const language = info.language?.toLowerCase().split("-").at(0);
    return [
      {
        source: "googlebooks",
        sourceId: id,
        title,
        subtitle: clipText({
          text: info.subtitle,
          maxChars: BOOK_TEXT_LIMITS.subtitle,
        }),
        authors,
        year: year === undefined ? undefined : Number(year),
        language:
          language !== undefined && /^[a-z]{2,3}$/.test(language)
            ? language
            : undefined,
        coverRef: info.imageLinks?.thumbnail === undefined ? undefined : id,
      } satisfies CatalogueBook,
    ];
  });
}
