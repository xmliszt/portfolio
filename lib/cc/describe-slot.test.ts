import assert from "node:assert/strict";
import { test } from "node:test";

import { describeSlot } from "./describe-slot";
import { sgtToUtc } from "./sgt-to-utc";

test("labels 21:00 SGT in July as 9 am ET", () => {
  assert.equal(
    describeSlot({
      platformId: "instagram",
      at: sgtToUtc({ date: "2026-07-15", time: "21:00" }),
      source: "researched",
    }),
    "Wed 21:00 SGT · Instagram's best day · 9 am ET"
  );
});

test("labels 22:00 SGT in November as 9 am ET", () => {
  assert.equal(
    describeSlot({
      platformId: "instagram",
      at: sgtToUtc({ date: "2026-11-11", time: "22:00" }),
      source: "researched",
    }),
    "Wed 22:00 SGT · Instagram's best day · 9 am ET"
  );
});

test("uses the window label for platforms researched in Singapore time", () => {
  assert.equal(
    describeSlot({
      platformId: "wechat_channels",
      at: sgtToUtc({ date: "2026-07-15", time: "20:30" }),
      source: "researched",
    }),
    "Wed 20:30 SGT · any day suits 视频号 · evening"
  );
});
