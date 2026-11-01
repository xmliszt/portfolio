import type { PlanRow } from "@/lib/cc/plan-campaign-schedule";
import type { PlatformId } from "@/lib/cc/platforms";

/** One row of the proposed schedule as the Overview shows it, with times already written in Singapore time. */
export type PlanPreviewRow = {
  postId: string;
  platformId: PlatformId;
  name: string;
  wave: number | undefined;
  kind: PlanRow["kind"];
  currentLabel: string | undefined;
  proposedLabel: string | undefined;
  reason: string;
};
