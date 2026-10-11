import assert from "node:assert/strict";
import { test } from "node:test";

import { getRegionTier } from "./get-region-tier";
import { parseRoomRegion } from "./parse-room-region";

const SINGAPORE = { latDeg: 1, lonDeg: 104 };
const KUALA_LUMPUR = { latDeg: 3, lonDeg: 102 };
const TOKYO = { latDeg: 36, lonDeg: 140 };
const LONDON = { latDeg: 52, lonDeg: 0 };

test("parses header strings and rounds to whole degrees", () => {
  assert.deepEqual(
    parseRoomRegion({ latitude: "1.2897", longitude: "103.8501" }),
    SINGAPORE
  );
});

test("drops a missing or impossible region", () => {
  assert.equal(
    parseRoomRegion({ latitude: null, longitude: "103" }),
    undefined
  );
  assert.equal(parseRoomRegion({ latitude: "91", longitude: "0" }), undefined);
  assert.equal(parseRoomRegion({ latitude: "x", longitude: "0" }), undefined);
});

test("ranks nearer regions into lower tiers", () => {
  assert.equal(getRegionTier({ own: SINGAPORE, other: SINGAPORE }), 0);
  assert.equal(getRegionTier({ own: SINGAPORE, other: KUALA_LUMPUR }), 0);
  assert.equal(getRegionTier({ own: SINGAPORE, other: TOKYO }), 2);
  assert.equal(getRegionTier({ own: SINGAPORE, other: LONDON }), 3);
});

test("puts unknown regions last", () => {
  assert.equal(getRegionTier({ own: undefined, other: SINGAPORE }), 3);
  assert.equal(getRegionTier({ own: SINGAPORE, other: undefined }), 3);
});
