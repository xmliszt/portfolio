import assert from "node:assert/strict";
import { test } from "node:test";

import { INITIAL_COFFEE_STATE } from "./coffee-state";
import { getFlaskClockOffsetMs } from "./get-flask-clock-offset-ms";

const flask = { ...INITIAL_COFFEE_STATE.flask, brewedBy: "them" };

test("reads the brewer's offset", () => {
  assert.equal(
    getFlaskClockOffsetMs({
      flask,
      ownVisitorId: "me",
      clockOffsetsMs: { them: 7 },
    }),
    7
  );
});

test("uses no offset for an own brew, an unknown brewer or an inherited key", () => {
  const cases: Parameters<typeof getFlaskClockOffsetMs>[0][] = [
    { flask, ownVisitorId: "them", clockOffsetsMs: { them: 7 } },
    { flask, ownVisitorId: "me", clockOffsetsMs: {} },
    {
      flask: { ...flask, brewedBy: "constructor" },
      ownVisitorId: "me",
      clockOffsetsMs: {},
    },
  ];
  for (const options of cases) {
    assert.equal(getFlaskClockOffsetMs(options), 0);
  }
});
