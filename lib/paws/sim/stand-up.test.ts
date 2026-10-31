import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { createSimCat } from "./create-sim-cat";
import { createWorld } from "./create-world";
import { setCatState } from "./set-cat-state";
import { standUp } from "./stand-up";

const buildCat = (options: { state: "sit" | "approach" }) => {
  const world = createWorld({ random: () => 0.5 });
  const cat = createSimCat({ world, userId: "u", look: buildLook() });
  cat.rest = options.state === "sit" ? "sit" : undefined;
  setCatState(cat, options.state);
  return { world, cat };
};

test("a sitting cat stands up and pauses", () => {
  const { world, cat } = buildCat({ state: "sit" });
  standUp({ world, cat });
  assert.equal(cat.state, "pause");
  assert.equal(cat.rest, undefined);
  assert.equal(cat.pauseSeconds, 3);
});

test("a cat that is already up keeps what it is doing", () => {
  const { world, cat } = buildCat({ state: "approach" });
  standUp({ world, cat });
  assert.equal(cat.state, "approach");
});
