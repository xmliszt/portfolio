import assert from "node:assert/strict";
import { test } from "node:test";

import type { FingerMessage } from "@/lib/paws/wire-types";

import { createFingerThrottle } from "./create-finger-throttle";

function buildRig() {
  const rig: {
    now: number;
    sent: FingerMessage[];
    timers: { at: number; run: () => void }[];
  } = {
    now: 0,
    sent: [],
    timers: [],
  };
  const throttle = createFingerThrottle({
    sendsPerSecond: 4,
    now: () => rig.now,
    schedule: ({ run, delayMs }) => {
      const timer = { at: rig.now + delayMs, run };
      rig.timers = [...rig.timers, timer];
      return () => {
        rig.timers = rig.timers.filter((candidate) => candidate !== timer);
      };
    },
    send: (finger) => {
      rig.sent = [...rig.sent, finger];
    },
  });
  function advanceTo(at: number) {
    rig.now = at;
    const due = rig.timers.filter((timer) => timer.at <= at);
    rig.timers = rig.timers.filter((timer) => timer.at > at);
    due.forEach((timer) => timer.run());
  }
  return { rig, throttle, advanceTo };
}

function buildFinger(options: {
  seq: number;
  pressed: boolean;
}): FingerMessage {
  return {
    userId: "u",
    x: options.seq,
    y: 0,
    t: options.seq,
    trail: [],
    pressed: options.pressed,
    seq: options.seq,
  };
}

test("sends the latest position once the wait ends while moving", () => {
  const { rig, throttle, advanceTo } = buildRig();
  throttle.push(buildFinger({ seq: 1, pressed: false }));
  advanceTo(50);
  throttle.push(buildFinger({ seq: 2, pressed: false }));
  advanceTo(100);
  throttle.push(buildFinger({ seq: 3, pressed: false }));
  assert.deepEqual(
    rig.sent.map((finger) => finger.seq),
    [1]
  );
  advanceTo(250);
  assert.deepEqual(
    rig.sent.map((finger) => finger.seq),
    [1, 3]
  );
});

test("sends a press and a release at once", () => {
  const { rig, throttle, advanceTo } = buildRig();
  throttle.push(buildFinger({ seq: 1, pressed: false }));
  advanceTo(10);
  throttle.push(buildFinger({ seq: 2, pressed: true }));
  advanceTo(20);
  throttle.push(buildFinger({ seq: 3, pressed: false }));
  assert.deepEqual(
    rig.sent.map((finger) => finger.seq),
    [1, 2, 3]
  );
  assert.equal(rig.timers.length, 0);
});

test("drops a waiting position when disposed", () => {
  const { rig, throttle, advanceTo } = buildRig();
  throttle.push(buildFinger({ seq: 1, pressed: false }));
  throttle.push(buildFinger({ seq: 2, pressed: false }));
  throttle.dispose();
  advanceTo(1000);
  assert.deepEqual(
    rig.sent.map((finger) => finger.seq),
    [1]
  );
});
