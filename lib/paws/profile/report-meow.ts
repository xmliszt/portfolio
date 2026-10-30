import "server-only";

import type { PawsServiceClient } from "./paws-service-client";
import type { ReportMeowResponse } from "./report-meow-api-types";

/** Record `reporterId`'s report of the own meow of the cat owned by `catUserId`, once per reporter and clip. */
export async function reportMeow(options: {
  client: PawsServiceClient;
  reporterId: string;
  catUserId: string;
}): Promise<ReportMeowResponse> {
  if (options.reporterId === options.catUserId) return { kind: "invalid" };
  const cat = await options.client.from("cats").select("meow_key").eq("user_id", options.catUserId).maybeSingle();
  if (cat.error) throw cat.error;
  const meowKey: unknown = cat.data?.meow_key;
  if (typeof meowKey !== "string") return { kind: "nothingToReport" };
  const inserted = await options.client
    .from("meow_reports")
    .upsert(
      { meow_key: meowKey, reporter_id: options.reporterId },
      { onConflict: "meow_key,reporter_id", ignoreDuplicates: true }
    )
    .select("meow_key");
  if (inserted.error) throw inserted.error;
  return inserted.data.length === 0 ? { kind: "alreadyReported" } : { kind: "reported" };
}
