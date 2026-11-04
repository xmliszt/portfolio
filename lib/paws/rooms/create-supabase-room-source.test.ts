import assert from "node:assert/strict";
import { test } from "node:test";

import type { createPawsBrowserClient } from "@/lib/paws/supabase/create-paws-browser-client";

import { createSupabaseRoomSource } from "./create-supabase-room-source";

type Status = "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED";

function buildRig() {
  const rig: {
    reports: { [topic: string]: (status: Status) => void };
    closedCount: number;
  } = { reports: {}, closedCount: 0 };
  const client = {
    realtime: { setAuth: () => Promise.resolve() },
    channel: (topic: string) => {
      const channel = {
        topic,
        on: () => channel,
        subscribe: (report: (status: Status) => void) => {
          rig.reports = { ...rig.reports, [topic]: report };
          return channel;
        },
        presenceState: () => ({}),
        track: () => Promise.resolve(),
        send: () => Promise.resolve(),
      };
      return channel;
    },
    removeChannel: (channel: { topic: string }) => {
      rig.reports[channel.topic]?.("CLOSED");
      return Promise.resolve("ok");
    },
    removeAllChannels: () => Promise.resolve([]),
  };
  const source = createSupabaseRoomSource({
    client: client as unknown as ReturnType<typeof createPawsBrowserClient>,
  });
  async function join() {
    const connection = source.join({
      roomId: "room-1",
      userId: "guest",
      connectionId: "guest-tab",
      role: "watcher",
      self: undefined,
      onPlayers: () => {},
      onFinger: () => {},
      onCats: () => {},
      onEvent: () => {},
      onChat: () => {},
      onClosed: () => {
        rig.closedCount += 1;
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    return connection;
  }
  function report(status: Status) {
    rig.reports["paws:room:room-1"]?.(status);
  }
  return { rig, join, report };
}

test("calls onClosed when the room channel reports CLOSED", async () => {
  const { rig, join, report } = buildRig();
  await join();
  report("SUBSCRIBED");
  report("CLOSED");
  assert.equal(rig.closedCount, 1);
});

test("does not call onClosed for the CLOSED that leave causes", async () => {
  const { rig, join, report } = buildRig();
  const connection = await join();
  report("SUBSCRIBED");
  connection.leave();
  assert.equal(rig.closedCount, 0);
});

test("does not call onClosed for errors the channel recovers from", async () => {
  const { rig, join, report } = buildRig();
  await join();
  report("SUBSCRIBED");
  report("CHANNEL_ERROR");
  report("TIMED_OUT");
  report("SUBSCRIBED");
  assert.equal(rig.closedCount, 0);
});
