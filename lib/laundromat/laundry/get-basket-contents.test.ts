import assert from "node:assert/strict";
import { test } from "node:test";

import { getBasketContents } from "./get-basket-contents";
import type { MachineRef } from "./laundry-state";

const washer: MachineRef = { id: "washer-1", kind: "washer", number: 1 };

test("holds the laundry the visitor is carrying", () => {
  assert.equal(
    getBasketContents({ kind: "carrying", laundry: "dirty" }),
    "dirty"
  );
  assert.equal(getBasketContents({ kind: "carrying", laundry: "wet" }), "wet");
  assert.equal(getBasketContents({ kind: "folded" }), "folded");
});

test("is empty while the laundry is in a machine", () => {
  assert.equal(getBasketContents({ kind: "loaded", machine: washer }), "empty");
  assert.equal(getBasketContents({ kind: "done", machine: washer }), "empty");
});
