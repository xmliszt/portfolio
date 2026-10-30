import type { SavedCat } from "@/lib/paws/cat-api-types";
import { parseCatLook } from "@/lib/paws/parse-cat-look";
import { parseVoiceSettings } from "@/lib/paws/profile/parse-voice-settings";

/** Return the saved cat in `value`, or `undefined` when any field is missing or malformed. */
export function parseSavedCat(value: unknown): SavedCat | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const look = "look" in value ? parseCatLook(value.look) : undefined;
  const voice = "voice" in value ? parseVoiceSettings(value.voice) : undefined;
  if (
    !look ||
    !voice ||
    !("meowUrl" in value && typeof value.meowUrl === "string") ||
    !("hasOwnMeow" in value && typeof value.hasOwnMeow === "boolean")
  ) {
    return undefined;
  }
  return { look, voice, meowUrl: value.meowUrl, hasOwnMeow: value.hasOwnMeow };
}
