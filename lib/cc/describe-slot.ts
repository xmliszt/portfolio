import { getResearchedSlot } from "./get-researched-slot";
import { getSgtParts } from "./get-sgt-parts";
import { type PlatformId, PLATFORMS } from "./platforms";
import { RESEARCHED_WINDOWS } from "./researched-windows";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const GOOD_DAY_WEIGHT = 0.7;

function formatTime(options: { hour: number; minute: number }) {
  return `${String(options.hour).padStart(2, "0")}:${String(options.minute).padStart(2, "0")}`;
}

function formatClockHour(options: { hour: number; minute: number }) {
  const hour12 = options.hour % 12 === 0 ? 12 : options.hour % 12;
  const minute =
    options.minute === 0 ? "" : `:${String(options.minute).padStart(2, "0")}`;
  return `${hour12}${minute} ${options.hour < 12 ? "am" : "pm"}`;
}

/** Return a short line on why `at` suits `platformId`, such as "Wed 22:00 SGT · Instagram's best day · 9 am ET". */
export function describeSlot(options: {
  platformId: PlatformId;
  at: Date;
  source: "own" | "researched";
}) {
  const parts = getSgtParts(options.at);
  const label = PLATFORMS[options.platformId].label;
  const when = `${WEEKDAY_LABELS.at(parts.weekday)} ${formatTime(parts)} SGT`;
  if (options.source === "own") {
    return `${when} · from your own ${label} views by hour`;
  }
  const research = RESEARCHED_WINDOWS[options.platformId];
  const slot = getResearchedSlot({
    platformId: options.platformId,
    weekday: parts.weekday,
    hour: parts.hour,
  });
  if (slot.window === undefined) {
    return `${when} · no researched ${label} window in your hours`;
  }
  const weights = research.dayWeights;
  const maxWeight = Math.max(...weights);
  const dayPhrase = weights.every((weight) => weight === maxWeight)
    ? `any day suits ${label}`
    : slot.dayWeight === maxWeight
      ? `${label}${label.endsWith("s") ? "'" : "'s"} best day`
      : slot.dayWeight >= GOOD_DAY_WEIGHT
        ? `a good day for ${label}`
        : `a slower day for ${label}`;
  const zone = research.audienceZone;
  const hourPhrase =
    zone === undefined
      ? slot.window.label
      : `${formatClockHour({ hour: (parts.hour + zone.offsetHours + 24) % 24, minute: parts.minute })} ${zone.label}`;
  return `${when} · ${dayPhrase} · ${hourPhrase}`;
}
