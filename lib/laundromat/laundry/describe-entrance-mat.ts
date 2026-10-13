import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { Homecoming } from "./get-homecoming";

/** Return the welcome mat's `label` and `tooltip` for heading home to `homecoming`, and `canLeave` unless the basket still holds dirty laundry. */
export function describeEntranceMat(options: {
  homecoming: Homecoming;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.entranceMat;
  const { homecoming } = options;
  switch (homecoming.kind) {
    case "fresh":
      return {
        label: copy.readyLabel({ laundry: "folded" }),
        tooltip: copy.readyTooltip,
        canLeave: true,
      };
    case "carrying":
      return homecoming.laundry === "wet"
        ? {
            label: copy.wetLabel,
            tooltip: copy.wetTooltip,
            canLeave: true,
          }
        : {
            label: copy.dirtyLabel,
            tooltip: copy.dirtyTooltip,
            canLeave: false,
          };
    case "away":
      return {
        label: copy.awayLabel,
        tooltip: copy.awayTooltip,
        canLeave: true,
      };
    default: {
      const unhandled: never = homecoming;
      return unhandled;
    }
  }
}
