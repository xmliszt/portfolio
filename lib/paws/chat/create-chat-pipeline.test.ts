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
  const rig: {
    lines: { id: string; at: Date; status: string }[];
    broadcast: ChatMessage[];
    moderated: number;
  } = {
    lines: (options.sent ?? []).map((at, index) => ({
      id: `old${index}`,
      at,
      status: "sent",
    })),
    broadcast: [],
    moderated: 0,
  };
  const deps: ChatPipelineDependencies = {
    isPlaying: async () => options.isPlaying ?? true,
    countLinesSince: async ({ since }) =>
      rig.lines.filter((line) => line.at >= since).length,
    insertLine: async () => {
      const id = `m${rig.lines.length + 1}`;
      rig.lines = [...rig.lines, { id, at: NOW, status: "pending" }];
      await Promise.resolve();
      return id;
    },
    deleteLine: async (id) => {
      rig.lines = rig.lines.filter((line) => line.id !== id);
    },
    markLine: async ({ id, status }) => {
      rig.lines = rig.lines.map((line) =>
        line.id === id ? { ...line, status } : line
      );
    },
    broadcast: async ({ message }) => {
      if (options.broadcastFails) throw new Error("realtime down");
      rig.broadcast = [...rig.broadcast, message];
    },
    moderation: {
      isFlagged: async () => {
        rig.moderated += 1;
        return options.isFlagged ?? false;
      },
    },
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

test("refuses a flagged line without sending it, and counts it toward the limit", async () => {
  const { rig, pipeline } = buildRig({ isFlagged: true });
  const kinds: string[] = [];
  for (let attempt = 0; attempt < 5; attempt++)
    kinds.push(
      (
        await pipeline.sendChat({
          user: PLAYER,
          body: { roomId: "r", text: "hi" },
        })
      ).kind
    );
  assert.deepEqual(kinds, [
    "refused",
    "refused",
    "refused",
    "tooFast",
    "tooFast",
  ]);
  assert.equal(rig.moderated, 3);
  assert.deepEqual(rig.broadcast, []);
});

test("parallel lines cannot get past the burst limit", async () => {
  const { rig, pipeline } = buildRig({});
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      pipeline.sendChat({ user: PLAYER, body: { roomId: "r", text: "hi" } })
    )
  );
  assert.ok(
    results.filter((result) => result.kind === "sent").length <= 3,
    results.map((result) => result.kind).join(" ")
  );
  assert.ok(rig.broadcast.length <= 3);
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
