import type { Database } from "@/lib/laundromat/supabase/__generated__/types";

export type LaundromatDatabase = Database;

export type Notebook = Database["laundro_cafe"]["Tables"]["notebooks"]["Row"];

export type NotebookEntry =
  Database["laundro_cafe"]["Tables"]["notebook_entries"]["Row"];

export const NOTEBOOK_SCRIPTS = [
  "latin",
  "korean",
  "japanese",
  "chinese",
  "arabic",
  "hebrew",
  "devanagari",
  "bengali",
] as const;

export type NotebookScript = (typeof NOTEBOOK_SCRIPTS)[number];

export const APPEND_ENTRY_REJECTIONS = [
  "missing_visitor",
  "empty_body",
  "body_too_long",
  "sign_off_too_long",
  "invalid_script",
  "contains_link",
  "invalid_line_count",
  "invalid_drawing",
  "rate_limited",
] as const;

export type AppendEntryRejection = (typeof APPEND_ENTRY_REJECTIONS)[number];

/** Return `true` if `message` is one of the rejections `append_entry` and `append_doodle` raise; `false` when it is any other error. */
export function isAppendEntryRejection(
  message: string
): message is AppendEntryRejection {
  return APPEND_ENTRY_REJECTIONS.some((rejection) => rejection === message);
}
