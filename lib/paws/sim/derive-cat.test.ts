import assert from "node:assert/strict";
import { test } from "node:test";

import { TAIL_SHAPES, type TailShape } from "@/lib/paws/cat-look";
import type { CatSnapshot } from "@/lib/paws/wire-types";

import { buildLook } from "./testing/build-look";
import { buildSnapshot } from "./testing/build-snapshot";
import { deriveCat } from "./derive-cat";

const tailTipOf = (options: {
  tailShape: TailShape;
  pose: CatSnapshot["pose"];
}) =>
  deriveCat({
    snapshot: buildSnapshot({ userId: "u", x: 0, y: 0, pose: options.pose }),
    look: buildLook({ tailShape: options.tailShape }),
    time: 3,
  }).tailTip;

test("sitting and sleeping cats wrap every tail shape the same way", () => {
  for (const pose of [
    { stand: 0, sit: 1, sleep: 0 },
    { stand: 0, sit: 0, sleep: 1 },
  ]) {
    const slim = tailTipOf({ tailShape: "slim", pose });
    for (const tailShape of TAIL_SHAPES)
      assert.deepEqual(tailTipOf({ tailShape, pose }), slim, tailShape);
  }
});

test("a standing cat's wave and hook tails bend away from a slim tail", () => {
  const pose = { stand: 1, sit: 0, sleep: 0 };
  const slim = tailTipOf({ tailShape: "slim", pose });
  assert.deepEqual(tailTipOf({ tailShape: "plume", pose }), slim);
  assert.notDeepEqual(tailTipOf({ tailShape: "wave", pose }), slim);
  assert.notDeepEqual(tailTipOf({ tailShape: "hook", pose }), slim);
  assert.notDeepEqual(
    tailTipOf({ tailShape: "wave", pose }),
    tailTipOf({ tailShape: "hook", pose })
  );
});
