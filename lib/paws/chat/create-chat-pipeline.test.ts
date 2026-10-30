import assert from "node:assert/strict";
import { test } from "node:test";

import type { ChatMessage } from "@/lib/paws/wire-types";

import {
  type ChatPipelineDependencies,
  createChatPipeline,
} from "./create-chat-pipeline";

const NOW = new Date("2026-10-30T12:00:00.000Z");
const PLAYER = { userId: "u", isAnonymous: false };

function buildRig(options: {
  isPlaying?: boolean;
  sent?: Date[];
  isFlagged?: boolean;
  broadcastFails?: boolean;
}) {
  const rig: { inserted: string[]; broadcast: ChatMessage[] } = {
    inserted: [],
    broadcast: [],
  };
  const deps: ChatPipelineDependencies = {
    isPlaying: async () => options.isPlaying ?? true,
    countSentSince: async ({ since }) =>
      (options.sent ?? []).filter((at) => at >= since).length,
    insertMessage: async ({ text }) => {
      rig.inserted = [...rig.inserted, text];
      return `m${rig.inserted.length}`;
    },
    broadcast: async ({ message }) => {
      if (options.broadcastFails) throw new Error("realtime down");
      rig.broadcast = [...rig.broadcast, message];
    },
    moderation: { isFlagged: async () => options.isFlagged ?? false },
    clock: { now: () => NOW },
    log: () => {},
  };
  return { rig, pipeline: createChatPipeline(deps) };
}

const secondsAgo = (seconds: number) =>
  new Date(NOW.getTime() - seconds * 1000);

test("sends a player's line to the room", async () => {
  const { rig, pipeline } = buildRig({});
  assert.deepEqual(
    await pipeline.sendChat({
      user: PLAYER,
      body: { roomId: "r", text: " hi  there " },
    }),
    { kind: "sent", message: { id: "m1", userId: "u", text: "hi there" } }
  );
  assert.deepEqual(rig.broadcast, [
    { id: "m1", userId: "u", text: "hi there" },
  ]);
});

test("guests and visitors without a cat in the room cannot chat", async () => {
  assert.equal(
    (
      await buildRig({}).pipeline.sendChat({
        user: { userId: "g", isAnonymous: true },
        body: { roomId: "r", text: "hi" },
      })
    ).kind,
    "signInRequired"
  );
  assert.equal(
    (
      await buildRig({ isPlaying: false }).pipeline.sendChat({
        user: PLAYER,
        body: { roomId: "r", text: "hi" },
      })
    ).kind,
    "notPlaying"
  );
});

test("limits a burst and a minute of lines", async () => {
  const burst = buildRig({
    sent: [secondsAgo(1), secondsAgo(2), secondsAgo(3)],
  });
  assert.equal(
    (
      await burst.pipeline.sendChat({
        user: PLAYER,
        body: { roomId: "r", text: "hi" },
      })
    ).kind,
    "tooFast"
  );
  const minute = buildRig({
    sent: Array.from({ length: 20 }, (_, index) => secondsAgo(15 + index * 2)),
  });
  assert.equal(
    (
      await minute.pipeline.sendChat({
        user: PLAYER,
        body: { roomId: "r", text: "hi" },
      })
    ).kind,
    "tooFast"
  );
});

test("refuses a flagged line without saving or sending it", async () => {
  const { rig, pipeline } = buildRig({ isFlagged: true });
  assert.equal(
    (
      await pipeline.sendChat({
        user: PLAYER,
        body: { roomId: "r", text: "hi" },
      })
    ).kind,
    "refused"
  );
  assert.deepEqual(rig.inserted, []);
  assert.deepEqual(rig.broadcast, []);
});

test("fails closed when a check or the broadcast throws", async () => {
  const { pipeline } = buildRig({ broadcastFails: true });
  assert.equal(
    (
      await pipeline.sendChat({
        user: PLAYER,
        body: { roomId: "r", text: "hi" },
      })
    ).kind,
    "failed"
  );
});
