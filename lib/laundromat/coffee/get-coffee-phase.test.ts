import assert from "node:assert/strict";
import { test } from "node:test";

import { describeCoffeeMachine } from "./describe-coffee-machine";
import { describeCoffeeSwitch } from "./describe-coffee-switch";
import { getCoffeePhase } from "./get-coffee-phase";

const timing = { brewMs: 40_000, hotMs: 240_000 };
const startedAt = 1_000_000;

function phaseAt(elapsedMs: number) {
  return getCoffeePhase({
    brewStartedAt: startedAt,
    now: startedAt + elapsedMs,
    ...timing,
  });
}

test("is idle before any brew", () => {
  assert.deepEqual(
    getCoffeePhase({ brewStartedAt: undefined, now: startedAt, ...timing }),
    { kind: "idle" }
  );
});

test("brews with progress, then holds a hot cup, then goes idle", () => {
  assert.deepEqual(phaseAt(10_000), { kind: "brewing", progress: 0.25 });
  assert.deepEqual(phaseAt(40_000), { kind: "hot" });
  assert.deepEqual(phaseAt(279_999), { kind: "hot" });
  assert.deepEqual(phaseAt(280_000), { kind: "idle" });
});

test("disables the switch only while brewing", () => {
  assert.deepEqual(describeCoffeeSwitch({ kind: "idle" }), {
    label: "Coffee machine switch, brew a coffee",
    tooltip: "brew a coffee",
    enabled: true,
  });
  assert.equal(
    describeCoffeeSwitch({ kind: "brewing", progress: 0.5 }).enabled,
    false
  );
  assert.equal(describeCoffeeSwitch({ kind: "hot" }).enabled, true);
});

test("gives the idle machine body no tooltip", () => {
  assert.equal(describeCoffeeMachine({ kind: "idle" }).tooltip, undefined);
  assert.equal(
    describeCoffeeMachine({ kind: "brewing", progress: 0 }).tooltip,
    "brewing…"
  );
});
