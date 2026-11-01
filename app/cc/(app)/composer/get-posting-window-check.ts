import { formatSgt } from "@/lib/cc/format-sgt";
import { getSgtParts } from "@/lib/cc/get-sgt-parts";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import {
  RESEARCHED_WINDOWS,
  type ResearchedWindow,
} from "@/lib/cc/researched-windows";

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

function formatWindow(window: ResearchedWindow) {
  return `${formatWeekdays(window.weekdays)} ${formatHour(window.startHour)}–${formatHour(window.endHour)}`;
}

function isInWindow(options: { window: ResearchedWindow; date: Date }) {
  const parts = getSgtParts(options.date);
  const hour = parts.hour + parts.minute / 60;
  const window = options.window;
  const isSameDay =
    window.weekdays.includes(parts.weekday) &&
    hour >= window.startHour &&
    hour < window.endHour;
  const isNextDay =
    window.endHour > 24 &&
    window.weekdays.includes((parts.weekday + 6) % 7) &&
    hour < window.endHour - 24;
  return isSameDay || isNextDay;
}

/** Return the check of `scheduledAt` against the platform's `RESEARCHED_WINDOWS`, or a manual reminder when the platform has none. */
export function getPostingWindowCheck(options: {
  platformId: PlatformId;
  scheduledAt: string | null;
}): PreflightCheck {
  const windows: readonly ResearchedWindow[] =
    RESEARCHED_WINDOWS[options.platformId];
  const label = "Posting window";
  const best = windows.toSorted((a, b) => b.strength - a.strength).at(0);
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
      why: `Not scheduled. Best window: ${formatWindow(best)} SGT.`,
    };
  }
  const date = new Date(options.scheduledAt);
  const match = windows.find((window) => isInWindow({ window, date }));
  const when = formatSgt({ date, pattern: "EEE dd MMM HH:mm" });
  return match === undefined
    ? {
        kind: "computed",
        id: "window",
        label,
        passed: false,
        why: `${when} SGT is outside the researched windows. Best: ${formatWindow(best)}.`,
      }
    : {
        kind: "computed",
        id: "window",
        label,
        passed: true,
        why: `${when} SGT is inside ${formatWindow(match)}.`,
      };
}
