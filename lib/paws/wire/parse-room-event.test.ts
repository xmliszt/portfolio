import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomEvent } from "./parse-room-event";

test("reads each kind of room event", () => {
  assert.deepEqual(
    parseRoomEvent({ kind: "sound", userId: "u", sound: "purr" }),
    { kind: "sound", userId: "u", sound: "purr" }
  );
  assert.deepEqual(
    parseRoomEvent({
      kind: "pawPrint",
      userId: "u",
      x: 1,
      y: 2,
      angle: 0.5,
      leg: 2,
    }),
    {
      kind: "pawPrint",
      userId: "u",
      x: 1,
      y: 2,
      angle: 0.5,
      leg: 2,
    }
  );
  assert.deepEqual(
    parseRoomEvent({ kind: "nosePrint", userId: "u", x: 1, y: 2, angle: 1 }),
    {
      kind: "nosePrint",
      userId: "u",
      x: 1,
      y: 2,
      angle: 1,
    }
  );
  assert.deepEqual(
    parseRoomEvent({
      kind: "fingerPrint",
      userId: "u",
      x: 1,
      y: 2,
      pressure: 3,
    }),
    {
      kind: "fingerPrint",
      userId: "u",
      x: 1,
      y: 2,
      pressure: 1,
    }
  );
});

test("clamps positions and the leg index", () => {
  assert.deepEqual(
    parseRoomEvent({
      kind: "pawPrint",
      userId: "u",
      x: -1e9,
      y: 1e9,
      angle: 100,
      leg: 9,
    }),
    {
      kind: "pawPrint",
      userId: "u",
      x: -200,
      y: 1200,
      angle: 4 * Math.PI,
      leg: 3,
    }
  );
});

test("drops unknown kinds and malformed events", () => {
  assert.equal(parseRoomEvent({ kind: "explode", userId: "u" }), undefined);
  assert.equal(
    parseRoomEvent({ kind: "sound", userId: "u", sound: "bark" }),
    undefined
  );
  assert.equal(
    parseRoomEvent({
      kind: "pawPrint",
      userId: "u",
      x: 1,
      y: 2,
      angle: 0,
      leg: 1.5,
    }),
    undefined
  );
  assert.equal(
    parseRoomEvent({ kind: "nosePrint", userId: "u", x: 1, y: 2 }),
    undefined
  );
  assert.equal(parseRoomEvent({ kind: "sound", sound: "meow" }), undefined);
});
