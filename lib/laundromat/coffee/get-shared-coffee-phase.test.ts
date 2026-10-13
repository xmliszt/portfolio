import assert from "node:assert/strict";
import { test } from "node:test";

import { INITIAL_COFFEE_STATE } from "./coffee-state";
import { getSharedCoffeePhase } from "./get-shared-coffee-phase";
import { transitionCoffee } from "./transition-coffee";

const timing = { flaskPortions: 4, brewMs: 40_000, hotMs: 240_000 };
const theirNow = 1_050_000;
const theirs = transitionCoffee({
  state: INITIAL_COFFEE_STATE,
  event: { type: "brew" },
  now: theirNow,
  flaskNow: theirNow,
  timing,
  visitorId: "them",
}).flask;

test("starts a flask brewed on a clock 50 s ahead at empty, done 40 s later on the local clock", () => {
  assert.deepEqual(
    getSharedCoffeePhase({
      flask: theirs,
      now: 1_000_000,
      timing,
      ownVisitorId: "me",
      clockOffsetsMs: { them: -50_000 },
    }),
    { kind: "brewing", level: 0, doneAt: 1_040_000, isSomeoneElse: true }
  );
});

test("fills it a quarter after 10 local seconds", () => {
  const phase = getSharedCoffeePhase({
    flask: theirs,
    now: 1_010_000,
    timing,
    ownVisitorId: "me",
    clockOffsetsMs: { them: -50_000 },
  });
  assert.equal(phase.kind === "brewing" ? phase.level : undefined, 0.25);
});
