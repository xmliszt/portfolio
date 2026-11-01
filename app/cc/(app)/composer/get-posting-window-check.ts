import maxBy from "lodash/maxBy.js";

import { describeSlot } from "@/lib/cc/describe-slot";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getResearchedSlot } from "@/lib/cc/get-researched-slot";
import { getSgtParts } from "@/lib/cc/get-sgt-parts";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { RESEARCHED_WINDOWS } from "@/lib/cc/researched-windows";

import type { PreflightCheck } from "./preflight-check";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHour(hour: number) {
  return `${String(hour > 24 ? hour - 24 : hour).padStart(2, "0")}:00`;
}

function formatWeekdays(weekdays: readonly number[]) {
  if (weekdays.length === 7) return "every day";
  const first = weekdays.at(0);
  const last = weekdays.at(-1);
  const isRun =
    first !== undefined &&
    last !== undefined &&
    weekdays.length > 2 &&
    last - first === weekdays.length - 1;
  return isRun
    ? `${WEEKDAY_LABELS.at(first)}–${WEEKDAY_LABELS.at(last)}`
    : weekdays.map((weekday) => WEEKDAY_LABELS.at(weekday)).join(", ");
}

const PASS_SCORE = 0.5;

function formatBest(platformId: PlatformId) {
  const research = RESEARCHED_WINDOWS[platformId];
  const weights = research.dayWeights;
  const maxWeight = Math.max(...weights);
  const bestDays = weights.flatMap((weight, weekday) =>
    weight === maxWeight ? [weekday] : []
  );
  const window = maxBy(research.hours, (hours) => hours.strength);
  return window === undefined
    ? undefined
    : `${formatWeekdays(bestDays)} ${formatHour(window.startHour)}–${formatHour(window.endHour)} SGT`;
}

/** Return the check of `scheduledAt` against the platform's researched day weights and hour windows, or a manual reminder when the platform has no hour windows. */
export function getPostingWindowCheck(options: {
  platformId: PlatformId;
  scheduledAt: string | null;
}): PreflightCheck {
  const label = "Posting window";
  const best = formatBest(options.platformId);
  if (best === undefined) {
    return {
      kind: "manual",
      id: "window",
      label,
      why: `No researched window for ${PLATFORMS[options.platformId].label}; pick the time by hand.`,
    };
  }
  if (options.scheduledAt === null) {
    return {
      kind: "computed",
      id: "window",
      label,
      passed: false,
      why: `Not scheduled. Best: ${best}.`,
    };
  }
  const date = new Date(options.scheduledAt);
  const parts = getSgtParts(date);
  const slot = getResearchedSlot({
    platformId: options.platformId,
    weekday: parts.weekday,
    hour: parts.hour,
  });
  const description = describeSlot({
    platformId: options.platformId,
    at: date,
    source: "researched",
  });
  if (slot.window === undefined) {
    return {
      kind: "computed",
      id: "window",
      label,
      passed: false,
      why: `${formatSgt({ date, pattern: "EEE dd MMM HH:mm" })} SGT is outside the researched windows. Best: ${best}.`,
    };
  }
  return slot.score >= PASS_SCORE
    ? { kind: "computed", id: "window", label, passed: true, why: description }
    : {
        kind: "computed",
        id: "window",
        label,
        passed: false,
        why: `${description}. Best: ${best}.`,
      };
}
