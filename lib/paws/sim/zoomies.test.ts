import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { runWorld } from "./testing/run-world";
import { createSeededRandom } from "./create-seeded-random";
import { createWorld } from "./create-world";
import { startZoomies } from "./start-zoomies";

const players = [{ userId: "cat", look: buildLook({ size: "medium" }) }];

function settledWorld() {
  const world = createWorld({ random: createSeededRandom({ seed: 8 }) });
  runWorld({ world, players, seconds: 12 });
  return world;
}

test("a cat on zoomies sprints, gallops a pair at a time, then stops", () => {
  const world = settledWorld();
  const cat = world.cats.cat;
  startZoomies({ world, cat });
  let topSpeed = 0;
  let mixedSwings = 0;
  runWorld({
    world,
    players,
    seconds: 10,
    onStep: () => {
      topSpeed = Math.max(topSpeed, cat.speed / cat.build.scale);
      const swinging = cat.legs.filter((leg) => leg.swing !== undefined);
      if (
        cat.state === "zoom" &&
        cat.speed / cat.build.scale > 600 &&
        swinging.some((leg) => leg.front) &&
        swinging.some((leg) => !leg.front)
      )
        mixedSwings += 1;
    },
  });
  assert.ok(topSpeed > 500, `reaches a sprint, top speed ${topSpeed} a unit of scale`);
  assert.equal(mixedSwings, 0, "front and hind pairs never swing together");
  assert.notEqual(cat.state, "zoom", "the zoomies end");
});

test("cats get zoomies on their own now and then", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 2 }) });
  const crowd = [0, 1, 2].map((index) => ({
    userId: `cat-${index}`,
    look: buildLook({ size: "medium" }),
  }));
  let zoomed = false;
  runWorld({
    world,
    players: crowd,
    seconds: 300,
    onStep: (current) => {
      zoomed ||= Object.values(current.cats).some((cat) => cat.state === "zoom");
    },
  });
  assert.ok(zoomed);
});
