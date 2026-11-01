import assert from "node:assert/strict";
import { test } from "node:test";

import { GUIDE_FADE_SECONDS } from "./guide-fade-seconds";
import { GUIDE_STEPS_PER_SECOND } from "./guide-steps-per-second";
import { GUIDE_TAKES } from "./guide-takes";
import { runGuideTake } from "./run-guide-take";

for (const [name, take] of Object.entries(GUIDE_TAKES)) {
  test(`the ${name} take covers its loop and fade, from clock 0`, () => {
    const frames = runGuideTake(take);
    assert.equal(
      frames.length,
      Math.round(
        (take.loopSeconds + GUIDE_FADE_SECONDS) * GUIDE_STEPS_PER_SECOND
      ) + 1
    );
    assert.equal(frames.at(0)?.time, 0);
  });

  test(`the ${name} take plays the same every run`, () => {
    assert.deepEqual(
      runGuideTake(take).at(-1)?.cats,
      runGuideTake(take).at(-1)?.cats
    );
  });
}

test("the cats take shows a tail bat before its loop fades", () => {
  const take = GUIDE_TAKES.cats;
  const frames = runGuideTake(take);
  assert.ok(
    frames.some(
      (frame) =>
        frame.time < take.loopSeconds &&
        frame.cats.some(
          (cat) => cat.userId === "social-a" && cat.activity === "bat"
        )
    )
  );
});

test("the toy takes show the cat knocking its toy before the loop fades", () => {
  for (const name of ["yarn", "roll", "bowl"] as const) {
    const take = GUIDE_TAKES[name];
    const knocked = runGuideTake(take).find((frame) => {
      const toy = frame.toys.at(0);
      if (toy === undefined) return false;
      return toy.kind === "bowl"
        ? toy.spill !== undefined
        : Math.hypot(toy.x - 830, toy.y - 505) > 30;
    });
    assert.ok(
      knocked !== undefined && knocked.time < take.loopSeconds / 2,
      `${name} was not knocked early enough`
    );
  }
});

test("the box take shows the cat going into the box and coming back out", () => {
  const take = GUIDE_TAKES.box;
  const frames = runGuideTake(take).filter(
    (frame) => frame.time < take.loopSeconds
  );
  const box = frames.at(0)?.toys.at(0);
  assert.ok(box !== undefined);
  const gapAt = (frame: (typeof frames)[number]) => {
    const cat = frame.cats.at(0);
    return cat === undefined
      ? Infinity
      : Math.hypot(cat.x - box.x, cat.y - box.y);
  };
  const inside = frames.findIndex((frame) => gapAt(frame) < 10);
  assert.ok(inside > 0, "the cat never got into the box");
  assert.ok(
    frames.slice(inside).some((frame) => gapAt(frame) > 80),
    "the cat never came back out"
  );
});
