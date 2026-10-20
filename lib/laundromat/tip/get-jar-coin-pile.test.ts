import assert from "node:assert/strict";
import { test } from "node:test";

import { getJarCoinPile, MAX_PILE_COINS } from "./get-jar-coin-pile";

test("lays one coin per tip up to the cap, inside the jar, bottom layer first", () => {
  assert.equal(getJarCoinPile(0).length, 0);
  assert.equal(getJarCoinPile(12).length, 12);
  const full = getJarCoinPile(500);
  assert.equal(full.length, MAX_PILE_COINS);
  for (const coin of full) {
    assert.ok(Math.hypot(coin.u, coin.v) <= 0.8, JSON.stringify(coin));
  }
  assert.deepEqual(
    full.map(({ layer }) => layer),
    full.map(({ layer }) => layer).toSorted((a, b) => a - b)
  );
});

test("gives each coin the same place every time", () => {
  assert.deepEqual(getJarCoinPile(20), getJarCoinPile(20));
  assert.deepEqual(getJarCoinPile(20).slice(0, 10), getJarCoinPile(10));
});
