import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeLaundryBasket } from "./describe-laundry-basket";

test("labels the basket with what it holds", () => {
  assert.deepEqual(describeLaundryBasket({ basket: "wet", copy: en }), {
    label: "Laundry basket, wet clothes to dry",
    tooltip: "wet clothes · into a dryer",
  });
});

test("says what the basket holds at each step of the laundry", () => {
  assert.deepEqual(
    (["empty", "dirty", "wet", "folded"] as const).map(
      (basket) => describeLaundryBasket({ basket, copy: en }).tooltip
    ),
    [
      "basket · empty",
      "dirty clothes · into a washer",
      "wet clothes · into a dryer",
      "clean and dry · ready to go home",
    ]
  );
});
