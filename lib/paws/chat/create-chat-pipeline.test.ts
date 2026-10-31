import assert from "node:assert/strict";
import { test } from "node:test";

import type { ChatMessage } from "@/lib/paws/wire-types";

import {
  type ChatPipelineDependencies,
  createChatPipeline,
} from "./create-chat-pipeline";

const NOW = new Date("2026-10-30T12:00:00.000Z");
const PLAYER = { userId: "u", isAnonymous: false };
const LINE_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

function buildRig(options: {
  isPlaying?: boolean;
  sent?: Date[];
  broadcastFails?: boolean;
}) {
  const rig: {
    lines: { id: string; at: Date; status: string }[];
    broadcast: ChatMessage[];
  } = {
    lines: (options.sent ?? []).map((at, index) => ({
      id: `old${index}`,
      at,
      status: "sent",
    })),
    broadcast: [],
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
      body: { roomId: "r", lineId: LINE_ID, text: " hi  there " },
    }),
    { kind: "sent", message: { id: LINE_ID, userId: "u", text: "hi there" } }
  );
  assert.deepEqual(rig.broadcast, [
    { id: LINE_ID, userId: "u", text: "hi there" },
  ]);
});

test("guests and visitors without a cat in the room cannot chat", async () => {
  assert.equal(
    (
      await buildRig({}).pipeline.sendChat({
        user: { userId: "g", isAnonymous: true },
        body: { roomId: "r", lineId: LINE_ID, text: "hi" },
      })
    ).kind,
    "signInRequired"
  );
  assert.equal(
    (
      await buildRig({ isPlaying: false }).pipeline.sendChat({
        user: PLAYER,
        body: { roomId: "r", lineId: LINE_ID, text: "hi" },
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
        body: { roomId: "r", lineId: LINE_ID, text: "hi" },
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
        body: { roomId: "r", lineId: LINE_ID, text: "hi" },
      })
    ).kind,
    "tooFast"
  );
});

test("parallel lines cannot get past the burst limit", async () => {
  const { rig, pipeline } = buildRig({});
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      pipeline.sendChat({
        user: PLAYER,
        body: { roomId: "r", lineId: LINE_ID, text: "hi" },
      })
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
        body: { roomId: "r", lineId: LINE_ID, text: "hi" },
      })
    ).kind,
    "failed"
  );
});
