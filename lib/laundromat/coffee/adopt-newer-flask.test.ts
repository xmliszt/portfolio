import assert from "node:assert/strict";
import { test } from "node:test";

import { adoptNewerFlask } from "./adopt-newer-flask";
import { INITIAL_COFFEE_STATE } from "./coffee-state";

const brewing = {
  portions: 0,
  brewStartedAt: 500,
  brewedBy: "visitor-a",
  changedAt: 500,
};
const own = {
  portions: 4,
  brewStartedAt: undefined,
  hotUntil: 2000,
  brewedBy: undefined,
  changedAt: 900,
};

test("adopts a flask someone else brewed into an untouched one", () => {
  assert.deepEqual(
    adoptNewerFlask({
      flask: INITIAL_COFFEE_STATE.flask,
      others: [brewing],
      maxPortions: 5,
    }),
    { ...brewing, hotUntil: undefined }
  );
});

test("keeps its own flask unless another was changed later", () => {
  assert.equal(
    adoptNewerFlask({ flask: own, others: [brewing], maxPortions: 5 }),
    own
  );
  assert.equal(
    adoptNewerFlask({
      flask: own,
      others: [brewing, { portions: 2, hotUntil: 2000, changedAt: 950 }],
      maxPortions: 5,
    }).portions,
    2
  );
});

test("picks the same flask on every tab when two were changed at the same moment", () => {
  const poured = { portions: 3, hotUntil: 2000, changedAt: 900 };
  const fromOwn = adoptNewerFlask({
    flask: own,
    others: [poured],
    maxPortions: 5,
  });
  const fromPoured = adoptNewerFlask({
    flask: { ...poured, brewStartedAt: undefined, brewedBy: undefined },
    others: [{ portions: 4, hotUntil: 2000, changedAt: 900 }],
    maxPortions: 5,
  });
  assert.deepEqual(fromOwn, fromPoured);
});

test("caps a flask holding more than the machine's flask can", () => {
  assert.equal(
    adoptNewerFlask({
      flask: own,
      others: [{ portions: 20, changedAt: 1000 }],
      maxPortions: 5,
    }).portions,
    5
  );
});
