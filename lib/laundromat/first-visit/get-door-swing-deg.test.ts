import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "./bedroom-config";
import { getDoorSwingDeg } from "./get-door-swing-deg";

const { walkIn } = bedroomConfig.motion;

test("stays shut while the lever turns", () => {
  assert.equal(getDoorSwingDeg({ elapsedMs: 0, walkIn }), 0);
  assert.equal(getDoorSwingDeg({ elapsedMs: walkIn.leverMs, walkIn }), 0);
});

test("does most of the swing in the first 600 ms without passing the open angle", () => {
  const at600 = getDoorSwingDeg({ elapsedMs: walkIn.leverMs + 600, walkIn });
  assert.ok(at600 > walkIn.openDeg * 0.8, `${at600}° at 600 ms`);
  const samples = Array.from({ length: 300 }, (_, index) =>
    getDoorSwingDeg({ elapsedMs: index * 10, walkIn })
  );
  assert.ok(samples.every((deg) => deg <= walkIn.openDeg));
  assert.ok(
    samples.every((deg, index) => index === 0 || deg >= samples[index - 1])
  );
  assert.ok(walkIn.openDeg - samples[samples.length - 1] < 0.5);
});
