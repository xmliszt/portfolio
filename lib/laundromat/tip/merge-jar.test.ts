import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeJar } from "./merge-jar";

const coin = (number: number) => ({
  number,
  createdAt: `2026-10-20T0${number}:00:00Z`,
});

test("takes the loaded coins and keeps newer ones this tab already has", () => {
  assert.deepEqual(
    mergeJar({
      current: [coin(1), coin(2), coin(5)],
      loaded: [coin(1), coin(2), coin(3)],
    }),
    [coin(1), coin(2), coin(3), coin(5)]
  );
});

test("drops coins the database no longer has below its newest", () => {
  assert.deepEqual(
    mergeJar({ current: [coin(1), coin(2)], loaded: [coin(2)] }),
    [coin(2)]
  );
});
