import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCameraFocus } from "./parse-camera-focus";

test("reads the two focus targets", () => {
  assert.equal(parseCameraFocus("shelf"), "shelf");
  assert.equal(parseCameraFocus("notebook"), "notebook");
});

test("falls back to the room for anything else", () => {
  assert.equal(parseCameraFocus(null), "room");
  assert.equal(parseCameraFocus("washer"), "room");
  assert.equal(parseCameraFocus(""), "room");
});
