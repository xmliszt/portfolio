import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyDepartureSound } from "./get-toy-departure-sound";
import { TOY_DELIVERY_TIMING } from "./toy-delivery-timing";

test("departure sounds follow packing, hover and lift-off boundaries", () => {
  const ignitionMs = TOY_DELIVERY_TIMING.packMs;
  const hoverMs = ignitionMs + TOY_DELIVERY_TIMING.primeMs;
  const launchMs = hoverMs + TOY_DELIVERY_TIMING.hoverMs;
  for (const [elapsedMs, expected] of [
    [ignitionMs - 1, undefined],
    [ignitionMs, "toy-thruster"],
    [hoverMs - 1, "toy-thruster"],
    [hoverMs, "toy-hover-jets"],
    [launchMs - 1, "toy-hover-jets"],
    [launchMs, "toy-box-launch"],
    [TOY_DELIVERY_TIMING.departureMs, undefined],
  ] satisfies [number, string | undefined][]) {
    assert.equal(
      getToyDepartureSound({ elapsedMs, reducedMotion: false }),
      expected
    );
  }
});

test("reduced motion uses a short puff during its fade and no late sound", () => {
  assert.equal(
    getToyDepartureSound({ elapsedMs: 399, reducedMotion: true }),
    undefined
  );
  assert.equal(
    getToyDepartureSound({ elapsedMs: 400, reducedMotion: true }),
    "toy-thruster"
  );
  assert.equal(
    getToyDepartureSound({
      elapsedMs: TOY_DELIVERY_TIMING.reducedDepartureMs,
      reducedMotion: true,
    }),
    undefined
  );
  assert.equal(
    getToyDepartureSound({ elapsedMs: 60_000, reducedMotion: false }),
    undefined
  );
});
