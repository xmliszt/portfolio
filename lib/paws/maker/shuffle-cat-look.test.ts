import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCatLook } from "@/lib/paws/parse-cat-look";

import { shuffleCatLook } from "./shuffle-cat-look";

function seededRandom(options: { seed: number }) {
  let state = options.seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

test("always returns a look the API accepts", () => {
  for (let seed = 1; seed <= 200; seed += 1) {
    const look = shuffleCatLook({ random: seededRandom({ seed }) });
    assert.deepEqual(parseCatLook(look), look, `seed ${seed}`);
  }
});

test("picks the first option at 0 and the last just below 1", () => {
  assert.deepEqual(shuffleCatLook({ random: () => 0 }), {
    coat: "ginger",
    pattern: "solid",
    belly: "cream",
    pads: "pink",
    size: "small",
    fluff: "small",
    tail: "small",
    ears: "small",
  });
  assert.deepEqual(shuffleCatLook({ random: () => 0.999999 }), {
    coat: "black",
    pattern: "colorpoint",
    belly: "light",
    pads: "mixed",
    size: "large",
    fluff: "large",
    tail: "large",
    ears: "large",
  });
});

test("returns the same look for the same random sequence", () => {
  assert.deepEqual(
    shuffleCatLook({ random: seededRandom({ seed: 7 }) }),
    shuffleCatLook({ random: seededRandom({ seed: 7 }) })
  );
});

test("reaches every coat over many shuffles", () => {
  const random = seededRandom({ seed: 3 });
  const coats = new Set(
    Array.from({ length: 500 }, () => shuffleCatLook({ random }).coat)
  );
  assert.equal(coats.size, 10);
});
