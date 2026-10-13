import assert from "node:assert/strict";
import { test } from "node:test";

import { getBedroomMode } from "./get-bedroom-mode";

test("a fresh bedroom has clothes on the floor, an empty hamper and a door that waits for them", () => {
  assert.deepEqual(getBedroomMode({ home: { kind: "fresh" } }), {
    hasFloorClothes: true,
    isDoorOpen: false,
    basket: { kind: "hamper" },
  });
});

test("wet laundry comes home in the carried basket with nothing on the floor", () => {
  assert.deepEqual(
    getBedroomMode({ home: { kind: "carrying", laundry: "wet" } }),
    {
      hasFloorClothes: false,
      isDoorOpen: true,
      basket: { kind: "carried", laundry: "wet" },
    }
  );
});

test("laundry left in a machine leaves the bedroom bare with the door open", () => {
  assert.deepEqual(getBedroomMode({ home: { kind: "away" } }), {
    hasFloorClothes: false,
    isDoorOpen: true,
    basket: { kind: "none" },
  });
});
