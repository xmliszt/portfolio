import assert from "node:assert/strict";
import { test } from "node:test";

import { toStrokePath } from "./to-stroke-path";

test("draws nothing for no points and straight lines for one or two", () => {
  assert.equal(toStrokePath([]), "");
  assert.equal(toStrokePath([[1, 2]]), "M1 2");
  assert.equal(
    toStrokePath([
      [1, 2],
      [3, 4],
    ]),
    "M1 2 L3 4"
  );
});

test("curves through the midpoints between inner points", () => {
  assert.equal(
    toStrokePath([
      [0, 0],
      [10, 0],
      [10, 10],
      [20, 10],
    ]),
    "M0 0 Q10 0 10 5 Q10 10 15 10 L20 10"
  );
});
