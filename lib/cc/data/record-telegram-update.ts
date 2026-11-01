import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

const UNIQUE_VIOLATION = "23505";
const KEEP_MS = 7 * 24 * 60 * 60 * 1000;

/** Record `updateId` as received and delete records older than 7 days; return `duplicate` without recording when it was already recorded, throw on any other insert error, and log a failed delete. */
export async function recordTelegramUpdate(options: { updateId: number }) {
  const supabase = createCcServiceClient();
  const { error } = await supabase
    .from("telegram_updates")
    .insert({ update_id: options.updateId });
  if (error?.code === UNIQUE_VIOLATION) return "duplicate";
  if (error) throw error;
  const { error: pruneError } = await supabase
    .from("telegram_updates")
    .delete()
    .lt("received_at", new Date(Date.now() - KEEP_MS).toISOString());
  if (pruneError) console.error("CC Telegram update prune failed", pruneError);
  return "recorded";
}
