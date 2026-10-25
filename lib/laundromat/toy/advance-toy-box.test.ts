import assert from "node:assert/strict";
import { test } from "node:test";

import { advanceToyBox } from "./advance-toy-box";
import { getToyBoxWindow } from "./get-toy-box-window";
import type { ToyBoxState } from "./toy-box-view";
import { TOY_DELIVERY_TIMING } from "./toy-delivery-timing";

const hidden: ToyBoxState = {
  windowStartedAtMs: undefined,
  openingStartedAtMs: undefined,
  view: { kind: "hidden" },
};

function at(options: {
  hour: number;
  minute: number;
  second?: number;
  day?: number;
}) {
  return new Date(
    2026,
    9,
    options.day ?? 25,
    options.hour,
    options.minute,
    options.second ?? 0
  );
}

function advance(options: {
  state?: ToyBoxState;
  now: Date;
  nowMs?: number;
  reducedMotion?: boolean;
  visible?: boolean;
}) {
  return advanceToyBox({
    state: options.state ?? hidden,
    now: options.now,
    nowMs: options.nowMs ?? 0,
    openingMs: 1200,
    reducedMotion: options.reducedMotion ?? false,
    visible: options.visible ?? true,
  });
}

function opened(now: Date): ToyBoxState {
  return {
    windowStartedAtMs: getToyBoxWindow(now).startMs,
    openingStartedAtMs: undefined,
    view: { kind: "open", runStartedAtMs: 100 },
  };
}

test("the local daily window includes 19:55 and excludes 20:55", () => {
  assert.equal(
    getToyBoxWindow(at({ hour: 19, minute: 54, second: 59 })).active,
    false
  );
  assert.equal(getToyBoxWindow(at({ hour: 19, minute: 55 })).active, true);
  assert.equal(
    getToyBoxWindow(at({ hour: 20, minute: 54, second: 59 })).active,
    true
  );
  assert.equal(getToyBoxWindow(at({ hour: 20, minute: 55 })).active, false);
  assert.equal(getToyBoxWindow(at({ hour: 7, minute: 55 })).active, false);
});

test("a visit before or after the window starts hidden", () => {
  assert.equal(advance({ now: at({ hour: 19, minute: 54 }) }), hidden);
  assert.equal(advance({ now: at({ hour: 21, minute: 0 }) }), hidden);
});

test("arrival at the start or midway through the hour always ends boxed", () => {
  for (const now of [
    at({ hour: 19, minute: 55 }),
    at({ hour: 20, minute: 30 }),
  ]) {
    const arriving = advance({ now });
    assert.deepEqual(arriving.view, { kind: "arriving", startedAtMs: 0 });
    assert.equal(
      advance({ state: arriving, now, nowMs: TOY_DELIVERY_TIMING.arrivalMs })
        .view.kind,
      "closed"
    );
  }
});

test("20:55 interrupts a flight and captures it for packing", () => {
  const now = at({ hour: 20, minute: 55 });
  const departing = advance({ state: opened(now), now, nowMs: 1000 });
  assert.deepEqual(departing.view, {
    kind: "departing",
    startedAtMs: 1000,
    contents: { kind: "open", runStartedAtMs: 100 },
  });
  assert.equal(
    advance({
      state: departing,
      now,
      nowMs: 1000 + TOY_DELIVERY_TIMING.departureMs,
    }).view.kind,
    "hidden"
  );
});

test("a closed box leaves without showing its contents", () => {
  const now = at({ hour: 20, minute: 55 });
  const state: ToyBoxState = { ...opened(now), view: { kind: "closed" } };
  const result = advance({ state, now });
  assert.equal(result.view.kind, "departing");
  if (result.view.kind === "departing")
    assert.deepEqual(result.view.contents, { kind: "closed" });
});

test("closing time cancels an unfinished opening", () => {
  const now = at({ hour: 20, minute: 55 });
  const state: ToyBoxState = {
    ...opened(now),
    openingStartedAtMs: 100,
    view: { kind: "opening" },
  };
  const result = advance({ state, now, nowMs: 200 });
  assert.equal(result.view.kind, "departing");
  assert.equal(result.openingStartedAtMs, undefined);
});

test("returning after closing keeps the toy until its exit animation finishes", () => {
  const state = opened(at({ hour: 20, minute: 0 }));
  const suspended = advance({
    state,
    now: at({ hour: 20, minute: 30 }),
    nowMs: 1000,
    visible: false,
  });
  assert.equal(suspended.view.kind, "open");
  assert.equal(
    advance({
      state: suspended,
      now: at({ hour: 21, minute: 0 }),
      nowMs: 2000,
      visible: false,
    }),
    suspended
  );
  for (const now of [
    at({ hour: 21, minute: 0 }),
    at({ day: 26, hour: 0, minute: 0 }),
    at({ day: 26, hour: 10, minute: 0 }),
  ]) {
    const departing = advance({ state: suspended, now, nowMs: 100_000 });
    assert.equal(departing.view.kind, "departing");
    if (departing.view.kind === "departing")
      assert.equal(departing.view.startedAtMs, 100_000);
    assert.equal(
      advance({
        state: departing,
        now,
        nowMs: 100_000 + TOY_DELIVERY_TIMING.departureMs,
      }).view.kind,
      "hidden"
    );
  }
});

test("a suspended tab returning in the next daily window starts closed again", () => {
  const state = opened(at({ hour: 20, minute: 0 }));
  assert.equal(
    advance({ state, now: at({ day: 26, hour: 20, minute: 0 }) }).view.kind,
    "arriving"
  );
});

test("a clock moving backward out of the window hides the toy", () => {
  const state = opened(at({ hour: 20, minute: 0 }));
  assert.equal(
    advance({ state, now: at({ hour: 19, minute: 0 }) }).view.kind,
    "hidden"
  );
});

test("reduced motion completes both delivery phases with their shorter durations", () => {
  const now = at({ hour: 19, minute: 55 });
  const arriving = advance({ now, reducedMotion: true });
  assert.equal(
    advance({ state: arriving, now, nowMs: 400, reducedMotion: true }).view
      .kind,
    "closed"
  );
  const end = at({ hour: 20, minute: 55 });
  const departing = advance({
    state: opened(end),
    now: end,
    reducedMotion: true,
  });
  assert.equal(
    advance({ state: departing, now: end, nowMs: 900, reducedMotion: true })
      .view.kind,
    "hidden"
  );
});

test("an arrival started just before closing never becomes available afterward", () => {
  const state = advance({ now: at({ hour: 20, minute: 54, second: 59 }) });
  assert.equal(
    advance({ state, now: at({ hour: 20, minute: 55 }), nowMs: 1000 }).view
      .kind,
    "hidden"
  );
});

test("returning just after closing starts the full departure", () => {
  const now = at({ hour: 20, minute: 55, second: 6 });
  const state = opened(now);
  const departing = advance({ state, now, nowMs: 10_000 });
  assert.equal(departing.view.kind, "departing");
  if (departing.view.kind === "departing") {
    assert.equal(departing.view.startedAtMs, 10_000);
  }
});

test("closing preserves the progress of an interrupted opening", () => {
  for (const openingStartedAtMs of [900, 100]) {
    const now = at({ hour: 20, minute: 55 });
    const state: ToyBoxState = {
      ...opened(now),
      openingStartedAtMs,
      view: { kind: "opening" },
    };
    const departing = advance({ state, now, nowMs: 1000 });
    assert.equal(departing.view.kind, "departing");
    if (departing.view.kind === "departing")
      assert.deepEqual(departing.view.contents, {
        kind: "opening",
        startedAtMs: openingStartedAtMs,
      });
  }
});

test("forward time jumps play a full departure from the current animation time", () => {
  const now = at({ hour: 21, minute: 0 });
  const state = opened(now);
  for (const reducedMotion of [false, true]) {
    const options = { now, reducedMotion };
    const departing = advance({ ...options, state, nowMs: 1000 });
    assert.equal(departing.view.kind, "departing");
    if (departing.view.kind !== "departing") continue;
    assert.equal(departing.view.startedAtMs, 1000);
    const durationMs = reducedMotion
      ? TOY_DELIVERY_TIMING.reducedDepartureMs
      : TOY_DELIVERY_TIMING.departureMs;
    assert.equal(
      advance({ ...options, state: departing, nowMs: 1000 + durationMs - 1 })
        .view.kind,
      "departing"
    );
    assert.equal(
      advance({ ...options, state: departing, nowMs: 1000 + durationMs }).view
        .kind,
      "hidden"
    );
  }
});

test("hiding during departure pauses its elapsed animation time", () => {
  const now = at({ hour: 21, minute: 0 });
  const departing = advance({ state: opened(now), now, nowMs: 1000 });
  const suspended = advance({
    state: departing,
    now,
    nowMs: 2000,
    visible: false,
  });
  const resumed = advance({ state: suspended, now, nowMs: 100_000 });
  assert.equal(resumed.view.kind, "departing");
  if (resumed.view.kind !== "departing") return;
  assert.equal(resumed.view.startedAtMs, 99_000);
  assert.equal(
    advance({
      state: resumed,
      now,
      nowMs: 99_000 + TOY_DELIVERY_TIMING.departureMs - 1,
    }).view.kind,
    "departing"
  );
  assert.equal(
    advance({
      state: resumed,
      now,
      nowMs: 99_000 + TOY_DELIVERY_TIMING.departureMs,
    }).view.kind,
    "hidden"
  );
});

test("returning during the active hour catches up an unfinished opening", () => {
  const now = at({ hour: 20, minute: 0 });
  const state: ToyBoxState = {
    ...opened(now),
    openingStartedAtMs: 100,
    view: { kind: "opening" },
  };
  const suspended = advance({ state, now, nowMs: 200, visible: false });
  const resumed = advance({ state: suspended, now, nowMs: 5000 });
  assert.equal(resumed.view.kind, "open");
  assert.equal(resumed.openingStartedAtMs, 100);
});
