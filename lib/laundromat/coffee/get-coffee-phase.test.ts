import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import type { CoffeeEvent, CoffeeState } from "./coffee-state";
import { INITIAL_COFFEE_STATE } from "./coffee-state";
import { describeCoffeeFlask } from "./describe-coffee-flask";
import { describeCoffeeMachine } from "./describe-coffee-machine";
import { describeCoffeeSwitch } from "./describe-coffee-switch";
import type { CoffeePhase } from "./get-coffee-phase";
import { getCoffeePhase } from "./get-coffee-phase";
import { transitionCoffee } from "./transition-coffee";

const timing = { flaskPortions: 4, brewMs: 40_000, hotMs: 240_000 };
const startedAt = 1_000_000;

function apply(options: {
  state: CoffeeState;
  events: { event: CoffeeEvent; at: number }[];
}) {
  return options.events.reduce(
    (state, { event, at }) =>
      transitionCoffee({ state, event, now: startedAt + at, timing }),
    options.state
  );
}

function phaseAt(options: { state: CoffeeState; at: number }) {
  return getCoffeePhase({
    state: options.state,
    now: startedAt + options.at,
    timing,
  });
}

const brewed = apply({
  state: INITIAL_COFFEE_STATE,
  events: [{ event: { type: "brew" }, at: 0 }],
});

test("is empty before any brew", () => {
  assert.deepEqual(phaseAt({ state: INITIAL_COFFEE_STATE, at: 0 }), {
    kind: "empty",
  });
});

test("brews an empty flask to full, then keeps it hot for a while", () => {
  assert.deepEqual(phaseAt({ state: brewed, at: 10_000 }), {
    kind: "brewing",
    level: 0.25,
  });
  assert.deepEqual(phaseAt({ state: brewed, at: 40_000 }), {
    kind: "ready",
    level: 1,
    full: true,
    hot: true,
  });
  assert.deepEqual(phaseAt({ state: brewed, at: 280_000 }), {
    kind: "ready",
    level: 1,
    full: true,
    hot: false,
  });
});

test("pours one portion into an empty cup and drinks it", () => {
  const poured = apply({
    state: brewed,
    events: [{ event: { type: "pour" }, at: 50_000 }],
  });
  assert.equal(poured.portions, 3);
  assert.equal(poured.cup.kind, "full");
  const pouredTwice = apply({
    state: poured,
    events: [{ event: { type: "pour" }, at: 51_000 }],
  });
  assert.equal(pouredTwice.portions, 3, "a full cup takes no more coffee");
  const drunk = apply({
    state: poured,
    events: [
      { event: { type: "drink" }, at: 52_000 },
      { event: { type: "pour" }, at: 53_000 },
    ],
  });
  assert.equal(drunk.portions, 2);
  assert.equal(drunk.cup.kind, "full");
});

test("runs the flask dry one cup at a time", () => {
  const events = Array.from({ length: 5 }).flatMap(
    (_, index): { event: CoffeeEvent; at: number }[] => [
      { event: { type: "pour" }, at: 50_000 + index * 2 },
      { event: { type: "drink" }, at: 50_001 + index * 2 },
    ]
  );
  const dry = apply({ state: brewed, events });
  assert.equal(dry.portions, 0);
  assert.deepEqual(phaseAt({ state: dry, at: 60_000 }), { kind: "empty" });
});

test("tops up a part-full flask from its level in the remaining time", () => {
  const topped = apply({
    state: brewed,
    events: [
      { event: { type: "pour" }, at: 50_000 },
      { event: { type: "drink" }, at: 50_001 },
      { event: { type: "pour" }, at: 50_002 },
      { event: { type: "brew" }, at: 60_000 },
    ],
  });
  assert.deepEqual(phaseAt({ state: topped, at: 70_000 }), {
    kind: "brewing",
    level: 0.75,
  });
  assert.equal(phaseAt({ state: topped, at: 80_000 }).kind, "ready");
});

test("does not brew into a full flask", () => {
  const again = apply({
    state: brewed,
    events: [{ event: { type: "brew" }, at: 50_000 }],
  });
  assert.equal(again.brewStartedAt, undefined);
  const phase = phaseAt({ state: again, at: 50_000 });
  assert.equal(describeCoffeeSwitch({ phase, copy: en }).enabled, false);
});

test("enables the switch unless brewing or full, and the flask only when it can pour", () => {
  assert.equal(
    describeCoffeeSwitch({ phase: { kind: "empty" }, copy: en }).enabled,
    true
  );
  assert.equal(
    describeCoffeeSwitch({ phase: { kind: "brewing", level: 0.5 }, copy: en })
      .enabled,
    false
  );
  const partFull = {
    kind: "ready",
    level: 0.5,
    full: false,
    hot: true,
  } satisfies CoffeePhase;
  assert.equal(
    describeCoffeeSwitch({ phase: partFull, copy: en }).enabled,
    true
  );
  assert.equal(
    describeCoffeeFlask({ phase: partFull, cup: { kind: "empty" }, copy: en })
      .enabled,
    true
  );
  assert.equal(
    describeCoffeeFlask({
      phase: partFull,
      cup: { kind: "full", hotUntil: 0 },
      copy: en,
    }).enabled,
    false
  );
  assert.equal(
    describeCoffeeFlask({
      phase: { kind: "empty" },
      cup: { kind: "empty" },
      copy: en,
    }).enabled,
    false
  );
});

test("gives the empty machine body no tooltip", () => {
  assert.equal(
    describeCoffeeMachine({ phase: { kind: "empty" }, copy: en }).tooltip,
    undefined
  );
  assert.equal(
    describeCoffeeMachine({ phase: { kind: "brewing", level: 0 }, copy: en })
      .tooltip,
    "brewing…"
  );
});
