import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_CAMPAIGN_PLAN } from "./campaign-plan";
import { getHourHeat } from "./get-hour-heat";
import { getSlotScores } from "./get-slot-scores";
import type { PlatformId } from "./platforms";
import { sgtToUtc } from "./sgt-to-utc";
import { suggestNextSlot } from "./suggest-next-slot";

function buildOptions(options: {
  platformId?: PlatformId;
  notBefore?: Date;
  occupied?: Date[];
  excludedDays?: string[];
}) {
  const platformId = options.platformId ?? "instagram";
  return {
    platformId,
    notBefore:
      options.notBefore ?? sgtToUtc({ date: "2026-11-02", time: "12:00" }),
    occupied: options.occupied ?? [],
    minGapMinutes: DEFAULT_CAMPAIGN_PLAN.minGapMinutes,
    maxPerDay: DEFAULT_CAMPAIGN_PLAN.maxPerDay,
    availability: DEFAULT_CAMPAIGN_PLAN.availability,
    heat: getSlotScores({
      heat: getHourHeat({ posts: [], metrics: [], platformId }),
      platformId,
    }),
    excludedDays: options.excludedDays,
  };
}

function sgt(date: string, time: string) {
  return sgtToUtc({ date, time });
}

test("picks a strong later day over an earlier weak one", () => {
  const slot = suggestNextSlot(buildOptions({}));
  assert.deepEqual(slot?.at, sgt("2026-11-04", "22:00"));
  assert.equal(slot?.score, 1);
  assert.equal(slot?.reason, "Wed 22:00 SGT · Instagram's best day · 9 am ET");
});

test("never suggests a time before notBefore", () => {
  const notBefore = sgt("2026-11-04", "22:20");
  const slot = suggestNextSlot(buildOptions({ notBefore }));
  assert.deepEqual(slot?.at, sgt("2026-11-04", "22:30"));
});

test("keeps the minimum gap from occupied times on any platform", () => {
  const slot = suggestNextSlot(
    buildOptions({ occupied: [sgt("2026-11-04", "21:30")] })
  );
  assert.deepEqual(slot?.at, sgt("2026-11-04", "22:15"));
});

test("skips a day that already holds the maximum posts", () => {
  const slot = suggestNextSlot(
    buildOptions({
      occupied: [sgt("2026-11-04", "20:00"), sgt("2026-11-04", "20:45")],
    })
  );
  assert.deepEqual(slot?.at, sgt("2026-11-05", "22:00"));
});

test("skips excluded days", () => {
  const slot = suggestNextSlot(buildOptions({ excludedDays: ["2026-11-04"] }));
  assert.deepEqual(slot?.at, sgt("2026-11-05", "22:00"));
});

test("returns the same slot for the same input", () => {
  const options = buildOptions({ occupied: [sgt("2026-11-03", "22:00")] });
  assert.deepEqual(suggestNextSlot(options), suggestNextSlot(options));
});

test("takes the earliest free slot when the platform has no researched window", () => {
  const slot = suggestNextSlot(buildOptions({ platformId: "youtube" }));
  assert.deepEqual(slot?.at, sgt("2026-11-02", "20:00"));
  assert.equal(
    slot?.reason,
    "Mon 20:00 SGT · no researched YouTube window in your hours"
  );
});

test("returns undefined when no day is available", () => {
  const options = buildOptions({});
  assert.equal(
    suggestNextSlot({
      ...options,
      availability: options.availability.map(() => ({
        fromHour: 0,
        toHour: 0,
      })),
    }),
    undefined
  );
});

test("keeps the gap from an occupied time just after midnight", () => {
  const slot = suggestNextSlot(
    buildOptions({
      notBefore: sgt("2026-11-04", "23:30"),
      occupied: [sgt("2026-11-05", "00:15")],
    })
  );
  assert.ok(slot !== undefined);
  assert.notDeepEqual(slot.at, sgt("2026-11-04", "23:45"));
  assert.ok(
    Math.abs(slot.at.getTime() - sgt("2026-11-05", "00:15").getTime()) >=
      45 * 60_000
  );
});
