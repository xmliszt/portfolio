import assert from "node:assert/strict";
import { test } from "node:test";

import type { CatsMessage } from "@/lib/paws/wire-types";

import { buildSnapshot } from "./testing/build-snapshot";
import { createSnapshotBuffer } from "./create-snapshot-buffer";

const buildMessage = (options: {
  hostId: string;
  sentAt: number;
  x: number;
  heading: number;
}): CatsMessage => ({
  hostId: options.hostId,
  sentAt: options.sentAt,
  cats: [
    buildSnapshot({
      userId: "a",
      x: options.x,
      y: 100,
      heading: options.heading,
    }),
  ],
  prints: [],
});

test("plays cats back between the two messages around the delayed time", () => {
  const buffer = createSnapshotBuffer({ renderDelayMs: 100 });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 1000, x: 0, heading: 0 }),
    receivedAtMs: 5050,
  });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 1250, x: 100, heading: 1 }),
    receivedAtMs: 5300,
  });
  const [cat] = buffer.sample({ nowMs: 5050 + 225 });
  assert.ok(Math.abs(cat.x - 50) < 1e-9, `x ${cat.x}`);
  assert.ok(Math.abs(cat.heading - 0.5) < 1e-9);
});

test("turns the short way across ±π", () => {
  const buffer = createSnapshotBuffer({ renderDelayMs: 0 });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 0, x: 0, heading: 3 }),
    receivedAtMs: 0,
  });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 100, x: 0, heading: -3 }),
    receivedAtMs: 100,
  });
  const [cat] = buffer.sample({ nowMs: 50 });
  assert.ok(
    Math.abs(
      Math.abs(Math.atan2(Math.sin(cat.heading), Math.cos(cat.heading))) -
        Math.PI
    ) < 1e-9,
    `heading ${cat.heading}`
  );
});

test("holds the newest message once the delayed time passes it", () => {
  const buffer = createSnapshotBuffer({ renderDelayMs: 150 });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 0, x: 0, heading: 0 }),
    receivedAtMs: 0,
  });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 250, x: 100, heading: 0 }),
    receivedAtMs: 250,
  });
  assert.equal(buffer.sample({ nowMs: 600 })[0].x, 100);
  assert.equal(buffer.latest()[0].x, 100);
});

test("starts over when a new host takes over", () => {
  const buffer = createSnapshotBuffer({ renderDelayMs: 0 });
  buffer.push({
    message: buildMessage({ hostId: "old", sentAt: 0, x: 0, heading: 0 }),
    receivedAtMs: 0,
  });
  buffer.push({
    message: buildMessage({ hostId: "new", sentAt: 90_000, x: 40, heading: 0 }),
    receivedAtMs: 100,
  });
  assert.equal(buffer.sample({ nowMs: 100 })[0].x, 40);
});

test("ignores messages that arrive out of order", () => {
  const buffer = createSnapshotBuffer({ renderDelayMs: 0 });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 200, x: 20, heading: 0 }),
    receivedAtMs: 200,
  });
  buffer.push({
    message: buildMessage({ hostId: "h", sentAt: 100, x: 10, heading: 0 }),
    receivedAtMs: 210,
  });
  assert.equal(buffer.latest()[0].x, 20);
});
