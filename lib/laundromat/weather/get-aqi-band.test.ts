import assert from "node:assert/strict";
import { test } from "node:test";

import { getAqiBand } from "./get-aqi-band";

test("follows the US EPA band edges", () => {
  assert.equal(getAqiBand(0), "good");
  assert.equal(getAqiBand(50), "good");
  assert.equal(getAqiBand(51), "moderate");
  assert.equal(getAqiBand(100), "moderate");
  assert.equal(getAqiBand(101), "sensitive");
  assert.equal(getAqiBand(150), "sensitive");
  assert.equal(getAqiBand(151), "unhealthy");
  assert.equal(getAqiBand(169), "unhealthy");
  assert.equal(getAqiBand(200), "unhealthy");
  assert.equal(getAqiBand(201), "veryUnhealthy");
  assert.equal(getAqiBand(300), "veryUnhealthy");
  assert.equal(getAqiBand(301), "hazardous");
  assert.equal(getAqiBand(812), "hazardous");
});
