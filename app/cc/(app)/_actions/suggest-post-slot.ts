"use server";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { loadPlannerInput } from "@/lib/cc/data/load-planner-input";
import { formatSgt } from "@/lib/cc/format-sgt";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { suggestNextSlot } from "@/lib/cc/suggest-next-slot";

/** Return the next good Singapore-time `date` and `time` for a `platformId` post in `campaignId` with the reason, counting the campaign's other scheduled and posted `kind = 'post'` posts (not `postId`) and its reposts and the other campaigns' and custom posts (not `postId`) as taken; `undefined` when the next 14 days have no free slot. */
export async function suggestPostSlot(options: {
  campaignId: string;
  platformId: string;
  postId?: string;
}) {
  await requireCcOwner();
  const platformId = options.platformId;
  if (!isPlatformId(platformId)) {
    throw new Error(`Unknown platform ${platformId}`);
  }
  const input = await loadPlannerInput({ campaignId: options.campaignId });
  const taken = input.plannerPosts.flatMap((post) =>
    post.id !== options.postId &&
    (post.status === "scheduled" || post.status === "posted") &&
    post.scheduledAt !== undefined
      ? [{ at: post.scheduledAt, platformId: post.platformId }]
      : []
  );
  const slot = suggestNextSlot({
    platformId,
    notBefore: new Date(),
    occupied: [
      ...taken,
      ...input.occupied.filter((entry) => entry.postId !== options.postId),
    ].map((post) => post.at),
    minGapMinutes: input.plan.minGapMinutes,
    maxPerDay: input.plan.maxPerDay,
    availability: input.plan.availability,
    heat: input.heat[platformId],
    excludedDays:
      platformId === "reddit"
        ? taken
            .filter((post) => post.platformId === "reddit")
            .map((post) => formatSgt({ date: post.at, pattern: "yyyy-MM-dd" }))
        : undefined,
  });
  return slot === undefined
    ? undefined
    : {
        date: formatSgt({ date: slot.at, pattern: "yyyy-MM-dd" }),
        time: formatSgt({ date: slot.at, pattern: "HH:mm" }),
        reason: slot.reason,
      };
}
