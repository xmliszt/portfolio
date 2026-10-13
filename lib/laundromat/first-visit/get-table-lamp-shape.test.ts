import assert from "node:assert/strict";
import { test } from "node:test";

import { getTableLampShape } from "./get-table-lamp-shape";

const projection = { unit: 100, origin: { x: 0, y: 0 } };
const shape = getTableLampShape({
  center: { x: 0, y: 0 },
  tableTop: 0,
  domeRadius: 0.25,
  projection,
});

test("keeps the real lamp's proportions: 241 tall for a 160 wide dome", () => {
  assert.ok(Math.abs(shape.height / (2 * 0.25) - 241 / 160) < 0.01);
  assert.ok(Math.abs(shape.rimZ / shape.height - 150 / 241) < 0.01);
});

test("draws the stem as a symmetric trumpet that narrows to a neck", () => {
  const widths = shape.stemLeft.map(
    (left, index) => shape.stemRight[index]!.x - left.x
  );
  const neck = Math.min(...widths);
  assert.ok(widths[0]! > neck * 5, `flare ${widths[0]} vs neck ${neck}`);
  shape.stemLeft.forEach((left, index) =>
    assert.ok(Math.abs(left.y - shape.stemRight[index]!.y) < 1e-9)
  );
});

test("outlines the dome around its rim and finial base", () => {
  const xs = shape.dome.map((point) => point.x);
  const ys = shape.dome.map((point) => point.y);
  const rx = 0.25 * projection.unit * Math.SQRT2 * Math.cos(Math.PI / 6);
  assert.ok(Math.abs(Math.max(...xs) - rx) < 0.5);
  assert.ok(Math.abs(Math.min(...xs) + rx) < 0.5);
  assert.ok(Math.min(...ys) < shape.finial.cy + shape.finial.r);
});
