import assert from "node:assert/strict";
import { test } from "node:test";

import { getResidentCats } from "./get-resident-cats";

test("residents keep the looks and voices they had before tail shapes", () => {
  const residents = getResidentCats({ roomId: "room-1" }).map(
    ({ look: { tailShape: _, ...look }, ...resident }) => ({
      ...resident,
      look,
    })
  );
  assert.deepEqual(residents, [
    {
      userId: "resident-1",
      voice: { age: "old", voice: "raspy", mood: "sleepy" },
      look: {
        coat: "cinnamon",
        pattern: "calico",
        belly: "coat",
        pads: "pink",
        size: "small",
        fluff: "medium",
        tail: "small",
        ears: "large",
      },
    },
    {
      userId: "resident-2",
      voice: { age: "old", voice: "squeaky", mood: "grumpy" },
      look: {
        coat: "charcoal",
        pattern: "colorpoint",
        belly: "white",
        pads: "mauve",
        size: "small",
        fluff: "medium",
        tail: "medium",
        ears: "small",
      },
    },
    {
      userId: "resident-3",
      voice: { age: "adult", voice: "raspy", mood: "sleepy" },
      look: {
        coat: "charcoal",
        pattern: "tuxedo",
        belly: "coat",
        pads: "black",
        size: "medium",
        fluff: "large",
        tail: "large",
        ears: "large",
      },
    },
  ]);
});
