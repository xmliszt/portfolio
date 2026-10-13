import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "./bedroom-config";
import { getCurtainGap } from "./get-curtain-gap";
import { getCurtainLayout } from "./get-curtain-layout";

const { curtain } = bedroomConfig;
const layout = getCurtainLayout({ window: bedroomConfig.window, curtain });

test("leaves no glass uncovered once the panels meet", () => {
  const gap = getCurtainGap({
    leader: layout.closedLeader,
    layout,
    stackOutset: curtain.stackOutset,
  });
  assert.equal(gap.uncovered, 0);
  assert.equal(gap.near, gap.far);
});

test("leaves the middle of the glass uncovered when open", () => {
  const gap = getCurtainGap({
    leader: layout.openLeader,
    layout,
    stackOutset: curtain.stackOutset,
  });
  assert.ok(gap.uncovered > 0.5 && gap.uncovered < 1, `${gap.uncovered}`);
  assert.ok(gap.near > layout.opening.near && gap.far < layout.opening.far);
});
