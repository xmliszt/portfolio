import type { SavedCat } from "@/lib/paws/cat-api-types";
import { parseCatLook } from "@/lib/paws/parse-cat-look";

import { getBorrowedMeowUrl } from "./get-borrowed-meow-url";
import { parseVoiceSettings } from "./parse-voice-settings";

/** Return the saved cat in a `cats` row joined with its `meows` row, or `undefined` when the row is malformed; a missing or blocked meow gives the borrowed meow URL. */
export function toSavedCat(options: {
  row: unknown;
  getPublicUrl: (path: string) => string;
}): SavedCat | undefined {
  const row = options.row;
  if (
    typeof row !== "object" ||
    row === null ||
    !("look" in row) ||
    !("voice" in row)
  )
    return undefined;
  const look = parseCatLook(row.look);
  const voice = parseVoiceSettings(row.voice);
  if (look === undefined || voice === undefined) return undefined;
  const meow = "meows" in row ? row.meows : undefined;
  if (
    typeof meow !== "object" ||
    meow === null ||
    !("storage_path" in meow && typeof meow.storage_path === "string") ||
    !("blocked" in meow)
  ) {
    return {
      look,
      voice,
      meowUrl: getBorrowedMeowUrl(voice),
      hasOwnMeow: false,
    };
  }
  const meowUrl =
    meow.blocked === true
      ? getBorrowedMeowUrl(voice)
      : options.getPublicUrl(meow.storage_path);
  return { look, voice, meowUrl, hasOwnMeow: true };
}
