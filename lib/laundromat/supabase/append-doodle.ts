import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import type { DoodleDrawing } from "@/lib/laundromat/notebook/doodle-stroke";
import {
  AppendEntryRejection,
  isAppendEntryRejection,
  LaundromatDatabase,
  NotebookEntry,
} from "@/lib/laundromat/supabase/notebook-types";

type AppendDoodleOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  visitorId: string;
  drawing: DoodleDrawing;
  lineCount: number;
};

type AppendDoodleResult =
  | { kind: "placed"; entry: NotebookEntry }
  | { kind: "rejected"; reason: AppendEntryRejection };

/**
 * Place a doodle on the next free lines of the current notebook through `append_doodle`.
 * Returns `rejected` with the database's reason for validation and rate-limit failures; throws on any other error.
 */
export async function appendDoodle(
  options: AppendDoodleOptions
): Promise<AppendDoodleResult> {
  const { data, error } = await options.client.rpc("append_doodle", {
    p_visitor_id: options.visitorId,
    p_drawing: options.drawing,
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
