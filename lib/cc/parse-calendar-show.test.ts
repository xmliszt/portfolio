import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCalendarShow } from "./parse-calendar-show";

const OPTION_IDS = ["campaign-a", "campaign-b", "other"];

test("shows every option when the value is unset", () => {
  assert.deepEqual(
    parseCalendarShow({ value: undefined, optionIds: OPTION_IDS }),
    OPTION_IDS
  );
});

test("keeps the requested options in option order", () => {
  assert.deepEqual(
    parseCalendarShow({ value: "other,campaign-a", optionIds: OPTION_IDS }),
    ["campaign-a", "other"]
  );
});

test("drops ids that are not options", () => {
  assert.deepEqual(
    parseCalendarShow({ value: "campaign-b,gone", optionIds: OPTION_IDS }),
    ["campaign-b"]
  );
});

test("shows every option when no requested id is an option", () => {
  assert.deepEqual(
    parseCalendarShow({ value: "gone,", optionIds: OPTION_IDS }),
    OPTION_IDS
  );
});
