import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

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
  assert.deepEqual(
    describeCoffeeSwitch({ phase: { kind: "idle" }, copy: en }),
    {
      label: "Coffee machine switch, brew a coffee",
      tooltip: "brew a coffee",
      enabled: true,
    }
  );
  assert.equal(
    describeCoffeeSwitch({
      phase: { kind: "brewing", progress: 0.5 },
      copy: en,
    }).enabled,
    false
  );
  assert.equal(
    describeCoffeeSwitch({ phase: { kind: "hot" }, copy: en }).enabled,
    true
  );
});

test("gives the idle machine body no tooltip", () => {
  assert.equal(
    describeCoffeeMachine({ phase: { kind: "idle" }, copy: en }).tooltip,
    undefined
  );
  assert.equal(
    describeCoffeeMachine({ phase: { kind: "brewing", progress: 0 }, copy: en })
      .tooltip,
    "brewing…"
  );
});
