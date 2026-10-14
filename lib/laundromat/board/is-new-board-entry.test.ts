import assert from "node:assert/strict";
import { test } from "node:test";

import { isNewBoardEntry } from "./is-new-board-entry";

test("marks only ids this build does not ship", () => {
  assert.equal(isNewBoardEntry("opening"), false);
  assert.equal(isNewBoardEntry("something-next"), true);
});
