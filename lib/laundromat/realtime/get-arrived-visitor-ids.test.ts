import assert from "node:assert/strict";
import { test } from "node:test";

import { getArrivedVisitorIds } from "./get-arrived-visitor-ids";

test("a visitor with no tab here before has arrived, once however many tabs they open", () => {
  assert.deepEqual(
    getArrivedVisitorIds({
      previous: [{ visitorId: "a" }],
      current: [{ visitorId: "a" }, { visitorId: "b" }, { visitorId: "b" }],
      ownVisitorId: "me",
    }),
    ["b"]
  );
});

test("a visitor opening another tab has not arrived", () => {
  assert.deepEqual(
    getArrivedVisitorIds({
      previous: [{ visitorId: "a" }],
      current: [{ visitorId: "a" }, { visitorId: "a" }],
      ownVisitorId: "me",
    }),
    []
  );
});

test("the visitor's own tabs are left out", () => {
  assert.deepEqual(
    getArrivedVisitorIds({
      previous: [],
      current: [{ visitorId: "me" }],
      ownVisitorId: "me",
    }),
    []
  );
});
