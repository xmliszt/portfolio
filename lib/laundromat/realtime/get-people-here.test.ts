import assert from "node:assert/strict";
import { test } from "node:test";

import { getPeopleHere } from "./get-people-here";

test("alone in the room counts one", () => {
  assert.equal(
    getPeopleHere({ isSynced: true, peers: [], ownVisitorId: "me" }),
    1
  );
});

test("each visitor counts once however many tabs they have open", () => {
  assert.equal(
    getPeopleHere({
      isSynced: true,
      peers: [
        { visitorId: "a" },
        { visitorId: "a" },
        { visitorId: "b" },
        { visitorId: "me" },
      ],
      ownVisitorId: "me",
    }),
    3
  );
});

test("there is no count before the first presence sync or without a visitor id", () => {
  assert.equal(
    getPeopleHere({
      isSynced: false,
      peers: [{ visitorId: "a" }],
      ownVisitorId: "me",
    }),
    undefined
  );
  assert.equal(
    getPeopleHere({
      isSynced: true,
      peers: [{ visitorId: "a" }],
      ownVisitorId: undefined,
    }),
    undefined
  );
});
