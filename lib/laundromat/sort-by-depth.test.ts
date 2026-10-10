import assert from "node:assert/strict";
import { test } from "node:test";

import { sortByDepth } from "./sort-by-depth";

function buildItem(options: { id: string; x: number; y: number; z: number }) {
  return {
    id: options.id,
    position: { x: options.x, y: options.y, z: options.z },
  };
}

test("paints smaller x + y first, then lower z", () => {
  const items = [
    buildItem({ id: "front", x: 4, y: 4, z: 0 }),
    buildItem({ id: "upper", x: 1, y: 0, z: 2.6 }),
    buildItem({ id: "lower", x: 1, y: 0, z: 0 }),
  ];
  assert.deepEqual(
    sortByDepth(items).map((item) => item.id),
    ["lower", "upper", "front"]
  );
});

test("leaves the input order untouched", () => {
  const items = [
    buildItem({ id: "b", x: 2, y: 0, z: 0 }),
    buildItem({ id: "a", x: 1, y: 0, z: 0 }),
  ];
  sortByDepth(items);
  assert.deepEqual(
    items.map((item) => item.id),
    ["b", "a"]
  );
});
