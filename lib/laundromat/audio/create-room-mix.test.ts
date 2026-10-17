import assert from "node:assert/strict";
import { test } from "node:test";

import { createRoomMix } from "./create-room-mix";
import type { RoomSoundGroup } from "./room-sound-groups";
import type { LoopName, SoundName } from "./sound-names";

function buildFakes() {
  const played: { name: SoundName; group: RoomSoundGroup }[] = [];
  const held: { name: LoopName; group: RoomSoundGroup; stopped: boolean }[] =
    [];
  const timers: { atMs: number; callback: () => void; cancelled: boolean }[] =
    [];
  const clock = { nowMs: 0 };
  const board = {
    play(name: SoundName, options: { group: RoomSoundGroup }) {
      played.push({ name, group: options.group });
    },
    holdLoop(name: LoopName, options: { group: RoomSoundGroup }) {
      const loop = { name, group: options.group, stopped: false };
      held.push(loop);
      return { stop: () => (loop.stopped = true) };
    },
  };
  function schedule(callback: () => void, delayMs: number) {
    const timer = { atMs: clock.nowMs + delayMs, callback, cancelled: false };
    timers.push(timer);
    return () => (timer.cancelled = true);
  }
  function advance(ms: number) {
    const untilMs = clock.nowMs + ms;
    for (;;) {
      const next = timers
        .filter((timer) => !timer.cancelled && timer.atMs <= untilMs)
        .toSorted((a, b) => a.atMs - b.atMs)
        .at(0);
      if (next === undefined) break;
      next.cancelled = true;
      clock.nowMs = next.atMs;
      next.callback();
    }
    clock.nowMs = untilMs;
  }
  const mix = createRoomMix({ board, schedule, random: () => 0.5 });
  return { mix, played, held, advance };
}

test("the mix holds every group's loops in its own channel and stops them all", () => {
  const { mix, held } = buildFakes();
  mix.startMix();
  assert.deepEqual(
    held.map((loop) => `${loop.group}:${loop.name}`),
    [
      "machines:washer-running",
      "machines:dryer-running",
      "coffee:coffee-brewing",
      "tv:tv-no-signal",
      "weather:rain-outside",
    ]
  );
  mix.stopMix();
  assert.ok(
    held.every((loop) => loop.stopped),
    "every loop stops"
  );
});

test("the mix plays each group's short sounds now and then", () => {
  const { mix, played, advance } = buildFakes();
  mix.startMix();
  advance(20_000);
  const heard = new Set(played.map((entry) => entry.group));
  const groups: RoomSoundGroup[] = [
    "shop-bell",
    "unloading",
    "lamp",
    "weather",
    "coffee",
  ];
  groups.forEach((group) =>
    assert.ok(heard.has(group), `${group} plays in 20s`)
  );
  mix.stopMix();
  const count = played.length;
  advance(60_000);
  assert.equal(played.length, count, "nothing plays after the mix stops");
});

test("a solo plays its group at once and lingers after it ends", () => {
  const { mix, played, held, advance } = buildFakes();
  mix.startSolo("shop-bell");
  assert.deepEqual(played, [{ name: "shop-bell", group: "shop-bell" }]);
  advance(2_600);
  assert.equal(played.length, 2, "the bell repeats while held");
  mix.startSolo("weather");
  assert.equal(held.at(-1)?.name, "rain-outside");
  mix.endSolo("weather");
  advance(500);
  assert.equal(held.at(-1)?.stopped, false, "rain lingers briefly");
  advance(500);
  assert.equal(held.at(-1)?.stopped, true, "rain stops after the linger");
  assert.equal(mix.isHeard("weather"), false);
  assert.equal(mix.isHeard("shop-bell"), true);
});

test("a solo during the mix starts nothing new and keeps its group when the mix stops", () => {
  const { mix, held } = buildFakes();
  mix.startMix();
  const count = held.length;
  mix.startSolo("machines");
  assert.equal(held.length, count);
  mix.stopMix();
  const machines = held.filter((loop) => loop.group === "machines");
  assert.ok(
    machines.every((loop) => !loop.stopped),
    "machines keep playing"
  );
  assert.ok(
    held
      .filter((loop) => loop.group !== "machines")
      .every((loop) => loop.stopped)
  );
  mix.dispose();
  assert.ok(held.every((loop) => loop.stopped));
});
