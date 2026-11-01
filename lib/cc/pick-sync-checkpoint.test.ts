import assert from "node:assert/strict";
import { test } from "node:test";

import { pickSyncCheckpoint } from "./pick-sync-checkpoint";

const now = new Date("2026-11-10T02:20:00Z");

function hoursBefore(hours: number) {
  return new Date(now.getTime() - hours * 3_600_000);
}

test("picks 24h from 20 to 48 hours after posting", () => {
  for (const hours of [20, 30, 48]) {
    assert.equal(
      pickSyncCheckpoint({ postedAt: hoursBefore(hours), now, existing: [] }),
      "24h",
      `${hours} h`
    );
  }
});

test("picks 7d from 6.5 to 8 days after posting", () => {
  for (const hours of [156, 170, 192]) {
    assert.equal(
      pickSyncCheckpoint({ postedAt: hoursBefore(hours), now, existing: [] }),
      "7d",
      `${hours} h`
    );
  }
});

test("picks extra outside the windows", () => {
  for (const hours of [2, 19.5, 49, 100, 200, 600]) {
    assert.equal(
      pickSyncCheckpoint({ postedAt: hoursBefore(hours), now, existing: [] }),
      "extra",
      `${hours} h`
    );
  }
});

test("skips a window checkpoint that already has a row", () => {
  assert.equal(
    pickSyncCheckpoint({
      postedAt: hoursBefore(30),
      now,
      existing: [{ checkpoint: "24h", capturedAt: hoursBefore(5) }],
    }),
    undefined
  );
  assert.equal(
    pickSyncCheckpoint({
      postedAt: hoursBefore(170),
      now,
      existing: [{ checkpoint: "7d", capturedAt: hoursBefore(1) }],
    }),
    undefined
  );
});

test("allows one extra per SGT day", () => {
  const postedAt = hoursBefore(100);
  assert.equal(
    pickSyncCheckpoint({
      postedAt,
      now,
      existing: [
        { checkpoint: "extra", capturedAt: new Date("2026-11-09T17:00:00Z") },
      ],
    }),
    undefined
  );
  assert.equal(
    pickSyncCheckpoint({
      postedAt,
      now,
      existing: [
        { checkpoint: "extra", capturedAt: new Date("2026-11-09T15:00:00Z") },
      ],
    }),
    "extra"
  );
});

test("skips a post dated in the future", () => {
  assert.equal(
    pickSyncCheckpoint({ postedAt: hoursBefore(-1), now, existing: [] }),
    undefined
  );
});
