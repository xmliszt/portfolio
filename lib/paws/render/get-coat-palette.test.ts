import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BELLIES,
  type CatLook,
  COAT_INKS,
  PATTERNS,
} from "@/lib/paws/cat-look";
import { RISO } from "@/lib/paws/riso-inks";

import { getCoatPalette } from "./get-coat-palette";

const buildLook = (overrides: Partial<CatLook>): CatLook => ({
  coat: "ginger",
  pattern: "solid",
  belly: "cream",
  pads: "pink",
  size: "medium",
  fluff: "medium",
  tail: "medium",
  tailShape: "slim",
  ears: "medium",
  ...overrides,
});

test("no fur or belly ink matches the paper", () => {
  for (const pattern of PATTERNS) {
    for (const belly of BELLIES) {
      const palette = getCoatPalette({
        look: buildLook({ coat: "white", pattern, belly }),
        userId: "a",
      });
      const inks = [
        ...palette.spine,
        palette.head,
        palette.muzzle,
        palette.sock,
        palette.belly,
      ];
      assert.ok(!inks.includes(RISO.paper), `${pattern} ${belly}`);
    }
  }
});

test("a belly the same as the coat has no patch", () => {
  assert.equal(
    getCoatPalette({ look: buildLook({ belly: "coat" }), userId: "a" }).belly,
    undefined
  );
});

test("a tuxedo keeps white marks even with a coat-coloured belly", () => {
  const palette = getCoatPalette({
    look: buildLook({ coat: "black", pattern: "tuxedo", belly: "coat" }),
    userId: "a",
  });
  assert.equal(palette.muzzle, COAT_INKS.white);
  assert.equal(palette.sock, COAT_INKS.white);
  assert.equal(palette.spine[0], COAT_INKS.black);
});

test("a colorpoint has a light body and dark points", () => {
  const palette = getCoatPalette({
    look: buildLook({ coat: "chocolate", pattern: "colorpoint" }),
    userId: "a",
  });
  assert.notEqual(palette.spine[0], COAT_INKS.chocolate);
  assert.equal(palette.ears, COAT_INKS.chocolate);
  assert.ok(palette.tail.every((ink) => ink === COAT_INKS.chocolate));
});

test("mixed pads are picked per paw, the same for the same player", () => {
  const pick = (userId: string) =>
    getCoatPalette({ look: buildLook({ pads: "mixed" }), userId }).pads;
  assert.deepEqual(pick("player-1"), pick("player-1"));
  const users = Array.from({ length: 20 }, (_, i) => `player-${i}`);
  assert.ok(
    new Set(users.flatMap((userId) => pick(userId))).size > 1,
    "uses more than one ink"
  );
});
