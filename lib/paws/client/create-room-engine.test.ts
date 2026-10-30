import assert from "node:assert/strict";
import { test } from "node:test";

import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { createRoomEngine } from "./create-room-engine";

const DT_SECONDS = 1 / 60;

function buildPlayer(options: {
  userId: string;
  joinedAt: number;
}): PlayerPresence {
  return {
    userId: options.userId,
    connectionId: `${options.userId}-tab`,
    joinedAt: options.joinedAt,
    look: {
      coat: "ginger",
      pattern: "solid",
      belly: "cream",
      pads: "pink",
      size: "small",
      fluff: "small",
      tail: "small",
      ears: "small",
    },
    voice: { age: "adult", voice: "soft", mood: "chatty" },
    meowUrl: "/m.mp3",
  };
}

function buildFollower() {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 1 }) });
  engine.setPlayers([
    buildPlayer({ userId: "host", joinedAt: 1 }),
    buildPlayer({ userId: "me", joinedAt: 2 }),
  ]);
  engine.setSelf({ userId: "me", connectionId: "me-tab", role: "player" });
  return engine;
}

test("shows the host's paw prints once the render delay has passed", () => {
  const engine = buildFollower();
  engine.receiveCats({
    message: {
      hostId: "host-tab",
      sentAt: 0,
      cats: [],
      prints: [
        { kind: "pawPrint", userId: "host", x: 100, y: 100, angle: 0, leg: 0 },
      ],
    },
    receivedAtMs: 1000,
  });
  const early = engine.frame({
    nowMs: 1000 + ROOM_LIMITS.renderDelayMs - 1,
    dtSeconds: DT_SECONDS,
  });
  assert.equal(early.prints.length, 0, "print waits for the render delay");
  const due = engine.frame({
    nowMs: 1000 + ROOM_LIMITS.renderDelayMs,
    dtSeconds: DT_SECONDS,
  });
  assert.equal(due.prints.length, 1, "print shows after the render delay");
});

test("ignores cat messages from a connection that is not the host", () => {
  const engine = buildFollower();
  engine.receiveCats({
    message: {
      hostId: "me-tab",
      sentAt: 0,
      cats: [],
      prints: [
        { kind: "pawPrint", userId: "host", x: 1, y: 1, angle: 0, leg: 0 },
      ],
    },
    receivedAtMs: 0,
  });
  const frame = engine.frame({ nowMs: 10_000, dtSeconds: DT_SECONDS });
  assert.equal(frame.prints.length, 0);
});

test("sends a release when a pressed fingertip leaves", () => {
  const engine = buildFollower();
  engine.setOwnPointer({ x: 50, y: 60, present: true, pressed: true });
  assert.equal(
    engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS }).outgoing.finger?.pressed,
    true
  );
  engine.setOwnPointer({ x: 50, y: 60, present: false, pressed: false });
  const released = engine.frame({ nowMs: 16, dtSeconds: DT_SECONDS }).outgoing
    .finger;
  assert.deepEqual(
    { x: released?.x, y: released?.y, pressed: released?.pressed },
    { x: 50, y: 60, pressed: false }
  );
  assert.equal(
    engine.frame({ nowMs: 32, dtSeconds: DT_SECONDS }).outgoing.finger,
    undefined,
    "nothing more is sent once released"
  );
});

test("resends a still fingertip every second", () => {
  const engine = buildFollower();
  engine.setOwnPointer({ x: 50, y: 60, present: true, pressed: false });
  const sentAt = [0, 500, 999, 1000].filter(
    (nowMs) =>
      engine.frame({ nowMs, dtSeconds: DT_SECONDS }).outgoing.finger !==
      undefined
  );
  assert.deepEqual(sentAt, [0, 1000]);
});

test("a watcher sends its fingertip with the trail since its last message", () => {
  const engine = buildFollower();
  engine.setSelf({ userId: "me", connectionId: "me-tab", role: "watcher" });
  const sent = Array.from({ length: 31 }, (_, index) => index * 20).flatMap(
    (nowMs) => {
      engine.setOwnPointer({
        x: nowMs / 10,
        y: 60,
        present: true,
        pressed: false,
      });
      const finger = engine.frame({ nowMs, dtSeconds: DT_SECONDS }).outgoing
        .finger;
      return finger === undefined ? [] : [finger];
    }
  );
  assert.deepEqual(
    sent.map((finger) => finger.t),
    [0, 500],
    "sends at the room's finger rate"
  );
  assert.deepEqual(
    sent[1].trail.map((point) => point[2]),
    [60, 120, 180, 240, 300, 360, 420, 480]
  );
  assert.equal(sent[1].x, 50);
});

test("plays another visitor's fingertip back along a curve behind real time", () => {
  const engine = buildFollower();
  const positions: number[] = [];
  for (let nowMs = 0; nowMs <= 2000; nowMs += 20) {
    if (nowMs % 500 === 0)
      engine.receiveFinger({
        message: {
          userId: "guest",
          x: nowMs / 5,
          y: 100,
          t: nowMs,
          trail: [100, 200, 300, 400]
            .map((step) => nowMs - 500 + step)
            .filter((t) => t > 0)
            .map((t): [number, number, number] => [t / 5, 100, t]),
          pressed: false,
          seq: nowMs,
        },
        receivedAtMs: nowMs + 40,
      });
    const remote = engine
      .frame({ nowMs: nowMs + 40, dtSeconds: DT_SECONDS })
      .fingers.find((finger) => finger.kind === "remote");
    if (nowMs >= 1000 && remote !== undefined) positions.push(remote.x);
  }
  const steps = positions.slice(1).map((x, index) => x - positions[index]);
  assert.ok(
    steps.every((step) => step > 3 && step < 5),
    `moves evenly: ${steps.map((step) => step.toFixed(1)).join(" ")}`
  );
  assert.ok(
    positions[0] < 1000 / 5 - 100,
    `plays behind the latest point: ${positions[0]}`
  );
});
