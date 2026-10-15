import assert from "node:assert/strict";
import { test } from "node:test";

import { getOpenMeteoUrl } from "./get-open-meteo-url";

test("rounds coordinates so nearby visitors share one URL", () => {
  const url = new URL(
    getOpenMeteoUrl({ latitude: 1.2897, longitude: 103.8501 })
  );
  assert.equal(url.searchParams.get("latitude"), "1.3");
  assert.equal(url.searchParams.get("longitude"), "103.9");
  assert.equal(
    getOpenMeteoUrl({ latitude: 1.31, longitude: 103.88 }),
    url.toString()
  );
});
