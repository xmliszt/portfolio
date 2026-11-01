import assert from "node:assert/strict";
import { test } from "node:test";

import { getResearchedSlot } from "./get-researched-slot";
import { sgtToUtc } from "./sgt-to-utc";

test("puts the 9 am ET Instagram window at 21:00 SGT during US daylight saving time", () => {
  const july = getResearchedSlot({
    platformId: "instagram",
    at: sgtToUtc({ date: "2026-07-15", time: "21:00" }),
  });
  assert.equal(july.window?.label, "9 am ET");
  assert.equal(july.score, 1);
});

test("puts the 9 am ET Instagram window at 22:00 SGT during US standard time", () => {
  const november = getResearchedSlot({
    platformId: "instagram",
    at: sgtToUtc({ date: "2026-11-11", time: "22:00" }),
  });
  assert.equal(november.window?.label, "9 am ET");
  assert.equal(
    getResearchedSlot({
      platformId: "instagram",
      at: sgtToUtc({ date: "2026-11-11", time: "21:00" }),
    }).window,
    undefined
  );
});

test("weighs a US window by its Eastern weekday", () => {
  const slot = getResearchedSlot({
    platformId: "instagram",
    at: sgtToUtc({ date: "2026-11-12", time: "00:30" }),
  });
  assert.equal(slot.window?.label, "10 am–1 pm ET");
  assert.equal(slot.dayWeight, 1);
});

test("moves the Product Hunt launch hour with Pacific daylight saving time", () => {
  assert.equal(
    getResearchedSlot({
      platformId: "producthunt",
      at: sgtToUtc({ date: "2026-07-14", time: "15:30" }),
    }).score,
    1
  );
  assert.equal(
    getResearchedSlot({
      platformId: "producthunt",
      at: sgtToUtc({ date: "2026-11-10", time: "16:30" }),
    }).score,
    1
  );
});

test("keeps Asia-native windows in Singapore time", () => {
  const slot = getResearchedSlot({
    platformId: "xiaohongshu",
    at: sgtToUtc({ date: "2026-07-18", time: "21:30" }),
  });
  assert.equal(slot.window?.label, "情感 and 娱乐 peak");
  assert.equal(slot.score, 1);
});
