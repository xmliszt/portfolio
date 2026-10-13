import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "./bedroom-config";
import { getCurtainFolds } from "./get-curtain-folds";
import { getCurtainLayout } from "./get-curtain-layout";

const { curtain } = bedroomConfig;
const layout = getCurtainLayout({ window: bedroomConfig.window, curtain });
const rings = Array.from(
  { length: curtain.rings },
  (_, index) => index * layout.minGap
);

function folds(end: "near" | "far") {
  return getCurtainFolds({
    rings,
    hem: rings,
    layout,
    stackOutset: curtain.stackOutset,
    fabric: curtain.fabricPerGap,
    end,
  });
}

test("hangs rings on the rod plane and sets each pleat back from it", () => {
  const columns = folds("far");
  assert.equal(columns.length, curtain.rings * 2 - 1);
  columns.forEach((column, index) => {
    assert.equal(column.isRing, index % 2 === 0);
    if (column.isRing) assert.equal(column.top.x, layout.rodX);
    else assert.ok(column.top.x < layout.rodX);
  });
});

test("stacks each panel past its own end of the opening", () => {
  assert.equal(
    folds("far").at(0)?.top.y,
    layout.opening.far + curtain.stackOutset
  );
  assert.equal(
    folds("near").at(0)?.top.y,
    layout.opening.near - curtain.stackOutset
  );
});
