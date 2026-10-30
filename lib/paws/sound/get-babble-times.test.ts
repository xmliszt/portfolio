import assert from "node:assert/strict";
import { test } from "node:test";

import { getBabbleSyllables } from "./get-babble-syllables";
import { getBabbleTimes } from "./get-babble-times";

test("voiced syllables take one step and pauses take longer", () => {
  const times = getBabbleTimes({
    syllables: getBabbleSyllables("hi yo."),
    syllableSeconds: 0.1,
  });
  assert.deepEqual(
    times.startsAt.map((at) => Number(at.toFixed(2))),
    [0, 0.1, 0.2, 0.32, 0.42, 0.52]
  );
  assert.equal(Number(times.endsAt.toFixed(2)), 0.77);
});
