import assert from "node:assert/strict";
import { test } from "node:test";

import { toggleCalendarShow } from "./toggle-calendar-show";

const OPTION_IDS = ["campaign-a", "campaign-b", "other"];

test("turns an option on in option order", () => {
  assert.deepEqual(
    toggleCalendarShow({
      optionIds: OPTION_IDS,
      selectedIds: ["other"],
      optionId: "campaign-a",
    }),
    ["campaign-a", "other"]
  );
});

test("turns an option off and keeps the rest", () => {
  assert.deepEqual(
    toggleCalendarShow({
      optionIds: OPTION_IDS,
      selectedIds: OPTION_IDS,
      optionId: "campaign-b",
    }),
    ["campaign-a", "other"]
  );
});

test("shows a single campaign only once the others are turned off", () => {
  const withoutB = toggleCalendarShow({
    optionIds: OPTION_IDS,
    selectedIds: OPTION_IDS,
    optionId: "campaign-b",
  });
  assert.deepEqual(
    toggleCalendarShow({
      optionIds: OPTION_IDS,
      selectedIds: withoutB,
      optionId: "other",
    }),
    ["campaign-a"]
  );
});
