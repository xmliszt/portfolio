import type { Database } from "@/lib/laundromat/supabase/__generated__/types";

export type LaundromatDatabase = Database;

export type Notebook = Database["public"]["Tables"]["notebooks"]["Row"];

export type NotebookEntry =
  Database["public"]["Tables"]["notebook_entries"]["Row"];

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
  "rate_limited",
  "daily_limit_reached",
] as const;

export type AppendEntryRejection = (typeof APPEND_ENTRY_REJECTIONS)[number];
