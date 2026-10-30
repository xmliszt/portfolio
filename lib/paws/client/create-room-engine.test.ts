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
