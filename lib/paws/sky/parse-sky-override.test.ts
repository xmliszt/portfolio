import assert from "node:assert/strict";
import { test } from "node:test";

import { parseSkyOverride } from "./parse-sky-override";

test("keeps valid values and drops the rest", () => {
  assert.deepEqual(
    parseSkyOverride(
      new URLSearchParams("hour=21.5&season=winter&weather=snow")
    ),
    { hour: 21.5, season: "winter", weather: "snow" }
  );
  assert.deepEqual(
    parseSkyOverride(new URLSearchParams("hour=25&season=monsoon&weather=")),
    { hour: undefined, season: undefined, weather: undefined }
  );
});
