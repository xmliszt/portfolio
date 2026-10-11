import assert from "node:assert/strict";
import { test } from "node:test";

import { getIsoCylinder } from "./get-iso-cylinder";

const projection = { unit: 10, origin: { x: 100, y: 50 } };

function buildCylinder(options: { radius: number; topRadius?: number }) {
  return getIsoCylinder({
    center: { x: 2, y: 2 },
    bottom: 0,
    top: 1,
    radius: options.radius,
    topRadius: options.topRadius,
    projection,
  });
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

test("returns four facets, darkest first", () => {
  const { facets } = buildCylinder({ radius: 1 });
  assert.deepEqual(
    facets.map((facet) => facet.shade),
    [0, 1, 2, 3]
  );
});

test("spans the visible side from the right silhouette to the left", () => {
  const { base, facets } = buildCylinder({ radius: 1 });
  const rightmost = facets.at(0)?.points.at(0);
  const lastBase = facets
    .at(-1)
    ?.points.at(facets.at(-1)!.points.length / 2 - 1);
  assert.deepEqual(
    { x: round(rightmost?.x ?? 0), y: round(rightmost?.y ?? 0) },
    { x: round(base.cx + base.rx), y: round(base.cy) }
  );
  assert.deepEqual(
    { x: round(lastBase?.x ?? 0), y: round(lastBase?.y ?? 0) },
    { x: round(base.cx - base.rx), y: round(base.cy) }
  );
});

test("joins each facet to the next without a gap", () => {
  const { facets } = buildCylinder({ radius: 1, topRadius: 0.5 });
  facets.slice(1).forEach((facet, index) => {
    const previous = facets.at(index);
    assert.ok(previous);
    assert.deepEqual(
      facet.points.at(0),
      previous.points.at(previous.points.length / 2 - 1),
      `facet ${facet.shade} starts where facet ${index} ends`
    );
  });
});
