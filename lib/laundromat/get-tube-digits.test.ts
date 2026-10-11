import assert from "node:assert/strict";
import { test } from "node:test";

import { getTubeDigits } from "./get-tube-digits";

test("a small count lights only its own digits and keeps the leading zeros dark", () => {
  assert.deepEqual(getTubeDigits({ count: 7, tubeCount: 3 }), [
    { digit: 0, lit: false },
    { digit: 0, lit: false },
    { digit: 7, lit: true },
  ]);
  assert.deepEqual(getTubeDigits({ count: 42, tubeCount: 3 }), [
    { digit: 0, lit: false },
    { digit: 4, lit: true },
    { digit: 2, lit: true },
  ]);
});

test("zero lights the last tube, and a count past the tubes shows all nines", () => {
  assert.deepEqual(getTubeDigits({ count: 0, tubeCount: 2 }), [
    { digit: 0, lit: false },
    { digit: 0, lit: true },
  ]);
  assert.deepEqual(getTubeDigits({ count: 1234, tubeCount: 3 }), [
    { digit: 9, lit: true },
    { digit: 9, lit: true },
    { digit: 9, lit: true },
  ]);
});
