import assert from "node:assert/strict";
import { test } from "node:test";

import type { PlayerPresence } from "@/lib/paws/wire-types";

import { chooseHost } from "./choose-host";

function buildPlayer(options: {
  userId: string;
  joinedAt: number;
}): PlayerPresence {
  return {
    userId: options.userId,
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
    meowUrl: "/m",
  };
}

test("picks the player who joined first", () => {
  assert.equal(
    chooseHost([
      buildPlayer({ userId: "b", joinedAt: 2 }),
      buildPlayer({ userId: "c", joinedAt: 1 }),
    ]),
    "c"
  );
});

test("breaks a tie by user id", () => {
  assert.equal(
    chooseHost([
      buildPlayer({ userId: "b", joinedAt: 1 }),
      buildPlayer({ userId: "a", joinedAt: 1 }),
    ]),
    "a"
  );
});

test("has no host in an empty room", () => {
  assert.equal(chooseHost([]), undefined);
});
