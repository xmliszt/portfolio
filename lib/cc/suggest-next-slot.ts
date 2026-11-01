import countBy from "lodash/countBy.js";

import type { DayAvailability } from "./campaign-plan";
import { describeSlot } from "./describe-slot";
import { formatSgt } from "./format-sgt";
import { getSgtParts } from "./get-sgt-parts";
import type { SlotScores } from "./get-slot-scores";
import type { PlatformId } from "./platforms";
import { sgtToUtc } from "./sgt-to-utc";

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const STEP_MINUTES = 15;
const HORIZON_DAYS = 14;
const NEAR_BEST = 0.9;

function toDay(date: Date) {
  return formatSgt({ date, pattern: "yyyy-MM-dd" });
}

/** Return the earliest 15-minute slot in the 14 days from `notBefore` that is inside `availability`, at least `minGapMinutes` from every `occupied` time, on a day with fewer than `maxPerDay` of them and not in `excludedDays`, and scores within 10% of the best such slot; `undefined` when there is none. */
export function suggestNextSlot(options: {
  platformId: PlatformId;
  notBefore: Date;
  occupied: readonly Date[];
  minGapMinutes: number;
  maxPerDay: number;
  availability: readonly DayAvailability[];
  heat: SlotScores;
  excludedDays?: readonly string[];
}) {
  const end = options.notBefore.getTime() + HORIZON_DAYS * DAY_MS;
  const gapMs = options.minGapMinutes * MINUTE_MS;
  const firstMidnight = sgtToUtc({
    date: toDay(options.notBefore),
    time: "00:00",
  }).getTime();
  const countByDay = countBy(options.occupied, toDay);

  const candidates = Array.from(
    { length: HORIZON_DAYS + 1 },
    (_, offset) => new Date(firstMidnight + offset * DAY_MS)
  ).flatMap((midnight) => {
    const day = toDay(midnight);
    const weekday = getSgtParts(midnight).weekday;
    const hours = options.availability.at(weekday);
    if (
      hours === undefined ||
      options.excludedDays?.includes(day) ||
      (countByDay[day] ?? 0) >= options.maxPerDay
    ) {
      return [];
    }
    const stepCount = Math.max(
      0,
      ((hours.toHour - hours.fromHour) * 60) / STEP_MINUTES
    );
    return Array.from({ length: stepCount }, (_, step) => {
      const at = new Date(
        midnight.getTime() +
          (hours.fromHour * 60 + step * STEP_MINUTES) * MINUTE_MS
      );
      return {
        at,
        score: options.heat.cells.at(weekday)?.at(getSgtParts(at).hour) ?? 0,
      };
    }).filter(
      (candidate) =>
        candidate.at.getTime() >= options.notBefore.getTime() &&
        candidate.at.getTime() < end &&
        options.occupied.every(
          (time) => Math.abs(time.getTime() - candidate.at.getTime()) >= gapMs
        )
    );
  });

  const bestScore = Math.max(0, ...candidates.map((slot) => slot.score));
  const pick = candidates.find(
    (candidate) => candidate.score >= bestScore * NEAR_BEST
  );
  return pick === undefined
    ? undefined
    : {
        at: pick.at,
        score: pick.score,
        reason: describeSlot({
          platformId: options.platformId,
          at: pick.at,
          source: options.heat.source,
        }),
      };
}
