import assert from "node:assert/strict";
import { test } from "node:test";

import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import { getResidentCats } from "./get-resident-cats";
import { isResidentId } from "./is-resident-id";

test("knows every resident's id and nobody else's", () => {
  getResidentCats({ roomId: "room-1" }).forEach((resident) =>
    assert.equal(isResidentId(resident.userId), true, resident.userId)
  );
  assert.equal(isResidentId(`resident-${ROOM_LIMITS.residentCats + 1}`), false);
  assert.equal(isResidentId("resident-0"), false);
  assert.equal(isResidentId("resident-01"), false);
  assert.equal(isResidentId("0f8fad5b-d9cb-469f-a165-70867728950e"), false);
});
