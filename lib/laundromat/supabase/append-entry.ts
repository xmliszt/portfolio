import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import {
  APPEND_ENTRY_REJECTIONS,
  AppendEntryRejection,
  LaundromatDatabase,
  NotebookEntry,
  NotebookScript,
} from "@/lib/laundromat/supabase/notebook-types";

type AppendEntryOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  visitorId: string;
  body: string;
  signOff: string | undefined;
  script: NotebookScript;
  lineCount: number;
};

type AppendEntryResult =
  | { kind: "placed"; entry: NotebookEntry }
  | { kind: "rejected"; reason: AppendEntryRejection };

function isAppendEntryRejection(
  message: string
): message is AppendEntryRejection {
  return APPEND_ENTRY_REJECTIONS.some((rejection) => rejection === message);
}

/**
 * Place an entry on the next free lines of the current notebook through `append_entry`.
 * Returns `rejected` with the database's reason for validation and rate-limit failures; throws on any other error.
 */
export async function appendEntry(
  options: AppendEntryOptions
): Promise<AppendEntryResult> {
  const { data, error } = await options.client.rpc("append_entry", {
    p_visitor_id: options.visitorId,
    p_body: options.body,
    p_sign_off: options.signOff ?? "",
    p_script: options.script,
    p_line_count: options.lineCount,
  });

  if (error) {
    if (isAppendEntryRejection(error.message)) {
      return { kind: "rejected", reason: error.message };
    }
    throw error;
  }

  return { kind: "placed", entry: data };
}
