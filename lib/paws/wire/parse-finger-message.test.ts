import assert from "node:assert/strict";
import { test } from "node:test";

import { parseFingerMessage } from "./parse-finger-message";

test("reads a fingertip and clamps it to the world with its margin", () => {
  assert.deepEqual(
    parseFingerMessage({
      userId: "u",
      x: 5000,
      y: -900,
      pressed: true,
      seq: 3,
    }),
    {
      userId: "u",
      x: 1800,
      y: -200,
      pressed: true,
      seq: 3,
    }
  );
});

test("drops a fingertip with a missing or malformed field", () => {
  assert.equal(
    parseFingerMessage({
      userId: "u",
      x: Number.NaN,
      y: 1,
      pressed: true,
      seq: 1,
    }),
    undefined
  );
  assert.equal(
    parseFingerMessage({ userId: "u", x: 1, y: 1, pressed: "yes", seq: 1 }),
    undefined
  );
  assert.equal(
    parseFingerMessage({ userId: "u", x: 1, y: 1, pressed: true, seq: 1.5 }),
    undefined
  );
  assert.equal(
    parseFingerMessage({ userId: "u", x: 1, y: 1, pressed: true, seq: -1 }),
    undefined
  );
  assert.equal(
    parseFingerMessage({
      userId: "u".repeat(65),
      x: 1,
      y: 1,
      pressed: true,
      seq: 1,
    }),
    undefined
  );
  assert.equal(parseFingerMessage("finger"), undefined);
});

test("keeps only the known fields", () => {
  assert.deepEqual(
    parseFingerMessage({
      userId: "u",
      x: 1,
      y: 2,
      pressed: false,
      seq: 0,
      extra: "x",
    }),
    {
      userId: "u",
      x: 1,
      y: 2,
      pressed: false,
      seq: 0,
    }
  );
});
