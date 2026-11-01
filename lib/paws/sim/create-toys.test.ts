import assert from "node:assert/strict";
import { test } from "node:test";

import { createSeededRandom } from "./create-seeded-random";
import { createToys } from "./create-toys";

test("a room starts with two boxes and three full bowls apart from each other", () => {
  const world = { width: 1600, height: 1000 };
  for (const seed of [1, 2, 3, 4, 5]) {
    const toys = createToys({ random: createSeededRandom({ seed }), world });
    assert.equal(toys.filter((toy) => toy.kind === "box").length, 2);
    assert.equal(
      toys.filter((toy) => toy.kind === "bowl" && toy.spill === undefined)
        .length,
      3
    );
    for (const [i, a] of toys.entries())
      for (const b of toys.slice(i + 1))
        assert.ok(
          Math.hypot(a.x - b.x, a.y - b.y) > 200,
          `${a.id} and ${b.id} overlap with seed ${seed}`
        );
  }
});
