import assert from "node:assert/strict";
import { test } from "node:test";

import { parseFingerMessage } from "./parse-finger-message";

const finger = {
  userId: "u",
  x: 1,
  y: 2,
  t: 500,
  trail: [],
  pressed: false,
  seq: 0,
};

test("reads a fingertip and clamps it and its trail to the world with its margin", () => {
  assert.deepEqual(
    parseFingerMessage({
      ...finger,
      x: 5000,
      y: -900,
      trail: [
        [4000, 10, 100],
        [20, -900, 300],
      ],
      pressed: true,
      seq: 3,
    }),
    {
      ...finger,
      x: 1800,
      y: -200,
      trail: [
        [1800, 10, 100],
        [20, -200, 300],
      ],
      pressed: true,
      seq: 3,
    }
  );
});

test("keeps only well formed trail points in time order before the fingertip", () => {
  assert.deepEqual(
    parseFingerMessage({
      ...finger,
      trail: [
        [1, 1, 100],
        [1, 1, 50],
        ["a", 1, 200],
        [1, 1],
        [2, 2, 300],
        [3, 3, 500],
      ],
    })?.trail,
    [
      [1, 1, 100],
      [2, 2, 300],
    ]
  );
  assert.equal(
    parseFingerMessage({
      ...finger,
      trail: Array.from({ length: 40 }, (_, index) => [0, 0, index]),
    })?.trail.length,
    12
  );
});

test("drops a fingertip with a missing or malformed field", () => {
  assert.equal(parseFingerMessage({ ...finger, x: Number.NaN }), undefined);
  assert.equal(parseFingerMessage({ ...finger, t: "now" }), undefined);
  assert.equal(parseFingerMessage({ ...finger, trail: "path" }), undefined);
  assert.equal(parseFingerMessage({ ...finger, pressed: "yes" }), undefined);
  assert.equal(parseFingerMessage({ ...finger, seq: 1.5 }), undefined);
  assert.equal(parseFingerMessage({ ...finger, seq: -1 }), undefined);
  assert.equal(
    parseFingerMessage({ ...finger, userId: "u".repeat(65) }),
    undefined
  );
  assert.equal(parseFingerMessage("finger"), undefined);
});

test("keeps only the known fields", () => {
  assert.deepEqual(parseFingerMessage({ ...finger, extra: "x" }), finger);
});
