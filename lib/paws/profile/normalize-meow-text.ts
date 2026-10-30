import { MAX_MEOW_TEXT_LENGTH } from "@/lib/paws/voice-settings";

const DEFAULT_MEOW_TEXT = "meow";

/** Return `text` trimmed, with whitespace runs collapsed to one space, lowercased and cut to `MAX_MEOW_TEXT_LENGTH` characters, or `"meow"` when nothing is left. */
export function normalizeMeowText(text: string) {
  const collapsed = text.trim().replace(/\s+/g, " ").toLowerCase();
  const normalized = Array.from(collapsed).slice(0, MAX_MEOW_TEXT_LENGTH).join("").trimEnd();
  return normalized === "" ? DEFAULT_MEOW_TEXT : normalized;
}
