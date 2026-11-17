import assert from "node:assert/strict";

function visit(options: { value: unknown; path: string }) {
  const { value, path } = options;
  if (typeof value === "number") {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
  } else if (typeof value === "string") {
    assert.doesNotMatch(value, /NaN|Infinity|undefined/, path);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) =>
      visit({ value: item, path: `${path}[${index}]` })
    );
  } else if (typeof value === "object" && value !== null) {
    Object.entries(value).forEach(([key, item]) =>
      visit({ value: item, path: `${path}.${key}` })
    );
  }
}

/** Assert that every number in `shape` is finite and no string in it contains `NaN`, `Infinity` or `undefined`. */
export function assertFiniteShape(shape: unknown) {
  visit({ value: shape, path: "shape" });
}
