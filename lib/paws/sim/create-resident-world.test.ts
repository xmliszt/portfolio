import assert from "node:assert/strict";
import { test } from "node:test";

import { createResidentWorld } from "./create-resident-world";
import { createSeededRandom } from "./create-seeded-random";
import { isCatOnstage } from "./is-cat-onstage";

const look = {
  coat: "ginger",
  pattern: "tabby",
  belly: "cream",
  pads: "pink",
  size: "medium",
  fluff: "small",
  tail: "large",
  tailShape: "slim",
  ears: "medium",
} as const;

test("starts every cat inside the room", () => {
  const world = createResidentWorld({
    random: createSeededRandom({ seed: 3 }),
    players: ["r1", "r2", "r3"].map((userId) => ({ userId, look })),
  });
  const cats = Object.values(world.cats);
  assert.equal(cats.length, 3);
  cats.forEach((cat) => {
    assert.ok(isCatOnstage(cat), cat.userId);
    assert.ok(
      cat.x > 0 && cat.x < world.width && cat.y > 0 && cat.y < world.height
    );
  });
});
