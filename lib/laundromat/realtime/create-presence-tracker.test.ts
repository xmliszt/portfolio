import assert from "node:assert/strict";
import { test } from "node:test";

import { createPresenceTracker } from "./create-presence-tracker";

function isClaim(presence: string | undefined) {
  return presence?.endsWith("*") ?? false;
}

function buildTracker(options: {
  sends?: { sentAts: number[] };
  reply?: (presence: string) => Promise<boolean>;
  reservedForUrgent?: number;
  limit?: number;
}) {
  const clock = { now: 0 };
  const timers: { at: number; run: () => void; isCancelled: boolean }[] = [];
  const tracked: { at: number; presence: string }[] = [];
  const readiness: { at: number; isReady: boolean }[] = [];
  const tracker = createPresenceTracker<string>({
    limit: options.limit ?? 2,
    reservedForUrgent: options.reservedForUrgent ?? 0,
    windowMs: 100,
    sends: options.sends ?? { sentAts: [] },
    now: () => clock.now,
    schedule: ({ run, delayMs }) => {
      const timer = { at: clock.now + delayMs, run, isCancelled: false };
      timers.push(timer);
      return () => {
        timer.isCancelled = true;
      };
    },
    track: async (presence) => {
      tracked.push({ at: clock.now, presence });
      return options.reply === undefined ? true : options.reply(presence);
    },
    isUrgent: ({ presence, delivered }) =>
      isClaim(presence) !== isClaim(delivered),
    onUrgentReadyChange: (isReady) => {
      readiness.push({ at: clock.now, isReady });
    },
  });
  async function advanceTo(at: number) {
    await new Promise((resolve) => setImmediate(resolve));
    const due = timers
      .filter((timer) => !timer.isCancelled && timer.at <= at)
      .toSorted((a, b) => a.at - b.at)
      .at(0);
    if (due === undefined) {
      clock.now = at;
      return;
    }
    timers.splice(timers.indexOf(due), 1);
    clock.now = due.at;
    due.run();
    await advanceTo(at);
  }
  return {
    tracker,
    presences: () => tracked.map(({ presence }) => presence),
    tracked,
    readiness,
    advanceTo,
  };
}

test("a burst sends up to the limit, then only the latest state once the window frees up", async () => {
  const { tracker, tracked, advanceTo } = buildTracker({});
  tracker.setSubscribed(true);
  ["a", "b", "c", "d"].forEach((presence) => tracker.update(presence));
  await advanceTo(99);
  assert.deepEqual(tracked, [
    { at: 0, presence: "a" },
    { at: 0, presence: "b" },
  ]);
  await advanceTo(100);
  assert.deepEqual(tracked.at(-1), { at: 100, presence: "d" });
  assert.equal(tracked.length, 3);
});

test("an unchanged state is not sent again", async () => {
  const { tracker, tracked, advanceTo } = buildTracker({});
  tracker.setSubscribed(true);
  tracker.update("a");
  tracker.update("a");
  await advanceTo(1);
  assert.equal(tracked.length, 1);
});

test("nothing is sent before subscribing, and the latest state goes out on subscribe", async () => {
  const { tracker, tracked, advanceTo } = buildTracker({});
  tracker.update("a");
  tracker.update("b");
  await advanceTo(1);
  assert.equal(tracked.length, 0);
  tracker.setSubscribed(true);
  assert.deepEqual(tracked, [{ at: 1, presence: "b" }]);
});

test("resubscribing sends the same state again", async () => {
  const { tracker, presences, advanceTo } = buildTracker({});
  tracker.setSubscribed(true);
  tracker.update("a");
  tracker.setSubscribed(false);
  await advanceTo(200);
  tracker.setSubscribed(true);
  assert.deepEqual(presences(), ["a", "a"]);
});

test("a state that was not delivered is sent again within the limit", async () => {
  const { tracker, tracked, advanceTo } = buildTracker({
    reply: async () => false,
  });
  tracker.setSubscribed(true);
  tracker.update("a");
  await advanceTo(1);
  assert.deepEqual(tracked, [
    { at: 0, presence: "a" },
    { at: 0, presence: "a" },
  ]);
  await advanceTo(99);
  assert.equal(tracked.length, 2);
});

test("trackers sharing `sends` share the limit", async () => {
  const sends = { sentAts: [] };
  const first = buildTracker({ sends });
  first.tracker.setSubscribed(true);
  first.tracker.update("a");
  first.tracker.update("b");
  first.tracker.dispose();
  const second = buildTracker({ sends });
  second.tracker.setSubscribed(true);
  second.tracker.update("c");
  assert.equal(second.tracked.length, 0);
  await second.advanceTo(100);
  assert.deepEqual(second.tracked, [{ at: 100, presence: "c" }]);
});

test("a failure reply from before a rejoin does not send the state again", async () => {
  const replies: ((isDelivered: boolean) => void)[] = [];
  const { tracker, presences, advanceTo } = buildTracker({
    reply: () => new Promise((resolve) => replies.push(resolve)),
  });
  tracker.setSubscribed(true);
  tracker.update("a");
  tracker.setSubscribed(false);
  tracker.setSubscribed(true);
  replies.at(1)?.(true);
  replies.at(0)?.(false);
  await advanceTo(100);
  assert.deepEqual(presences(), ["a", "a"]);
});

test("dispose cancels a held-back send", async () => {
  const { tracker, tracked, advanceTo } = buildTracker({});
  tracker.setSubscribed(true);
  ["a", "b", "c"].forEach((presence) => tracker.update(presence));
  tracker.dispose();
  await advanceTo(200);
  assert.equal(tracked.length, 2);
});

test("a regular change leaves the reserved slot free, and an urgent one uses it", async () => {
  const { tracker, tracked, presences, advanceTo } = buildTracker({
    reservedForUrgent: 1,
  });
  tracker.setSubscribed(true);
  tracker.update("a");
  tracker.update("b");
  await advanceTo(1);
  assert.deepEqual(presences(), ["a"]);
  tracker.update("c*");
  assert.deepEqual(tracked.at(-1), { at: 1, presence: "c*" });
  await advanceTo(99);
  assert.equal(tracked.length, 2);
});

test("an urgent change replaces a held-back regular one and goes out now", async () => {
  const { tracker, presences, advanceTo } = buildTracker({
    reservedForUrgent: 1,
  });
  tracker.setSubscribed(true);
  tracker.update("a");
  tracker.update("b");
  tracker.update("c*");
  await advanceTo(200);
  assert.deepEqual(presences(), ["a", "c*"]);
});

test("a held claim is sent as urgent again after a resubscribe", async () => {
  const { tracker, tracked, advanceTo } = buildTracker({
    sends: { sentAts: [-50] },
    reservedForUrgent: 1,
  });
  tracker.setSubscribed(true);
  tracker.update("a*");
  tracker.setSubscribed(false);
  await advanceTo(60);
  tracker.setSubscribed(true);
  assert.deepEqual(tracked, [
    { at: 0, presence: "a*" },
    { at: 60, presence: "a*" },
  ]);
});

test("an undelivered claim is retried as urgent even with a regular change held back", async () => {
  const replies: ((isDelivered: boolean) => void)[] = [];
  const { tracker, tracked, advanceTo } = buildTracker({
    reply: () => new Promise((resolve) => replies.push(resolve)),
    sends: { sentAts: [-50] },
    reservedForUrgent: 1,
  });
  tracker.setSubscribed(true);
  tracker.update("a*");
  await advanceTo(60);
  tracker.update("b*");
  replies.at(0)?.(false);
  await advanceTo(61);
  assert.deepEqual(tracked, [
    { at: 0, presence: "a*" },
    { at: 60, presence: "b*" },
  ]);
});

test("readiness turns on when subscribed, off once the slots are used, and on again as they free up", async () => {
  const { tracker, readiness, advanceTo } = buildTracker({
    reservedForUrgent: 1,
  });
  tracker.setSubscribed(true);
  tracker.update("a");
  await advanceTo(10);
  tracker.update("b*");
  await advanceTo(100);
  assert.deepEqual(readiness, [
    { at: 0, isReady: true },
    { at: 10, isReady: false },
    { at: 100, isReady: true },
  ]);
});

test("readiness turns off when unsubscribed and is not reported after dispose", async () => {
  const { tracker, readiness, advanceTo } = buildTracker({});
  tracker.setSubscribed(true);
  tracker.setSubscribed(false);
  tracker.setSubscribed(true);
  tracker.update("a");
  tracker.update("b");
  tracker.dispose();
  await advanceTo(200);
  assert.deepEqual(readiness, [
    { at: 0, isReady: true },
    { at: 0, isReady: false },
    { at: 0, isReady: true },
    { at: 0, isReady: false },
  ]);
});

test("an undelivered release is retried as urgent while the room still holds the claim", async () => {
  const { tracker, tracked, advanceTo } = buildTracker({
    reply: async (presence) => isClaim(presence),
    sends: { sentAts: [-60] },
    limit: 3,
    reservedForUrgent: 1,
  });
  tracker.setSubscribed(true);
  tracker.update("a*");
  await advanceTo(10);
  tracker.update("a");
  await advanceTo(40);
  assert.deepEqual(tracked, [
    { at: 0, presence: "a*" },
    { at: 10, presence: "a" },
    { at: 40, presence: "a" },
  ]);
});
