import assert from "node:assert/strict";
import { test } from "node:test";

import { BOARD_UPDATES } from "./board/board-updates";
import { getVersionBody } from "./get-version-body";

test("sends only the build id without a supported locale", () => {
  for (const localeTag of [undefined, "xx"]) {
    assert.deepEqual(getVersionBody({ buildId: "b2", localeTag }), {
      buildId: "b2",
    });
  }
});

test("adds every board entry in the asked locale", () => {
  const body = getVersionBody({ buildId: "b2", localeTag: "zh-TW" });
  assert.equal(body.buildId, "b2");
  assert.equal(body.updates?.length, BOARD_UPDATES.length);
  assert.equal(
    body.updates?.find((entry) => entry.id === "opening")?.title,
    "laundro.cafe 開幕"
  );
});
