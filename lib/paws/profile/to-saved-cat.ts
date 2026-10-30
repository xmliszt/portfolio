import type { SavedCat } from "@/lib/paws/cat-api-types";
import { parseCatLook } from "@/lib/paws/parse-cat-look";

import { parseVoiceSettings } from "./parse-voice-settings";

/** Return the saved cat in a `cats` row, or `undefined` when the row is malformed. */
export function toSavedCat(row: unknown): SavedCat | undefined {
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
  return { look, voice };
}
