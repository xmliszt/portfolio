import assert from "node:assert/strict";
import { test } from "node:test";

import type { PlayerPresence } from "@/lib/paws/wire-types";

import { chooseHost } from "./choose-host";

function buildPlayer(options: {
  connectionId: string;
  joinedAt: number;
}): PlayerPresence {
  return {
    userId: `user-${options.connectionId}`,
    connectionId: options.connectionId,
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
  };
}

test("picks the player who joined first", () => {
  assert.equal(
    chooseHost([
      buildPlayer({ connectionId: "b", joinedAt: 2 }),
      buildPlayer({ connectionId: "c", joinedAt: 1 }),
    ]),
    "c"
  );
});

test("breaks a tie by connection id", () => {
  assert.equal(
    chooseHost([
      buildPlayer({ connectionId: "b", joinedAt: 1 }),
      buildPlayer({ connectionId: "a", joinedAt: 1 }),
    ]),
    "a"
  );
});

test("has no host in an empty room", () => {
  assert.equal(chooseHost([]), undefined);
});
