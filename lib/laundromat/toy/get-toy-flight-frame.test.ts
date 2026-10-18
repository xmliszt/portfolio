import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyFlightFrame } from "./get-toy-flight-frame";
import { TOY_FLIGHT } from "./toy-flight-timeline";

const ORIGIN = { x: 0.15, y: 5.5, z: 0 };

test("ends the run parked where it started", () => {
  const start = getToyFlightFrame({ elapsedMs: 0, origin: ORIGIN });
  const end = getToyFlightFrame({
    elapsedMs: TOY_FLIGHT.totalMs,
    origin: ORIGIN,
  });
  assert.equal(end.phase, "parked");
  assert.deepEqual(end.pose, start.pose);
});

test("lands upright facing away from the ramp, then hops, spins and drops back onto the start", () => {
  const afterDescend =
    TOY_FLIGHT.launchMs +
    TOY_FLIGHT.climbMs +
    TOY_FLIGHT.coastMs +
    TOY_FLIGHT.steadyMs +
    TOY_FLIGHT.descendMs;
  const settle = getToyFlightFrame({
    elapsedMs: afterDescend + TOY_FLIGHT.settleMs / 2,
    origin: ORIGIN,
  });
  assert.equal(settle.phase, "settle");
  assert.deepEqual(settle.pose.up, { x: 0, y: 0, z: 1 });
  assert.deepEqual(settle.pose.forward, { x: 0, y: 1, z: 0 });
  const hopTop = getToyFlightFrame({
    elapsedMs: afterDescend + TOY_FLIGHT.settleMs + TOY_FLIGHT.hopMs - 1,
    origin: ORIGIN,
  });
  assert.equal(hopTop.phase, "hop");
  assert.ok(hopTop.pose.center.z > settle.pose.center.z + 0.3);
  assert.ok(hopTop.thrusters.every((jet) => jet.direction.z === -1));
  const spin = getToyFlightFrame({
    elapsedMs:
      afterDescend +
      TOY_FLIGHT.settleMs +
      TOY_FLIGHT.hopMs +
      TOY_FLIGHT.spinMs / 2,
    origin: ORIGIN,
  });
  assert.equal(spin.phase, "spin");
  assert.ok(Math.abs(spin.pose.forward.x) > 0.99);
});

test("fires four downward jets while it sinks", () => {
  const descend = getToyFlightFrame({
    elapsedMs:
      TOY_FLIGHT.launchMs +
      TOY_FLIGHT.climbMs +
      TOY_FLIGHT.coastMs +
      TOY_FLIGHT.steadyMs +
      TOY_FLIGHT.descendMs / 2,
    origin: ORIGIN,
  });
  assert.equal(descend.thrusters.length, 4);
  for (const thruster of descend.thrusters) {
    assert.deepEqual(thruster.direction, { x: 0, y: 0, z: -1 });
    assert.ok(thruster.strength > 0);
  }
});

test("sits under the ramp's overhang only while it climbs and leaves the lip", () => {
  const launch = getToyFlightFrame({ elapsedMs: 10, origin: ORIGIN });
  const climb = getToyFlightFrame({
    elapsedMs: TOY_FLIGHT.launchMs + TOY_FLIGHT.climbMs / 2,
    origin: ORIGIN,
  });
  const pastLip = getToyFlightFrame({
    elapsedMs: TOY_FLIGHT.launchMs + TOY_FLIGHT.climbMs + TOY_FLIGHT.coastMs,
    origin: ORIGIN,
  });
  assert.equal(launch.slot, "front");
  assert.equal(climb.slot, "ramp");
  assert.equal(pastLip.slot, "front");
});
