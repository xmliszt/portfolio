import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeTokens } from "./merge-tokens";

const token = (options: {
  number: number;
  code: string;
  createdAt: string;
}) => ({
  ...options,
  uses: 1,
  usesLeft: 1,
});

test("keeps each code once, newest coin first, the later list winning", () => {
  const merged = mergeTokens([
    [
      token({ number: 1, code: "a", createdAt: "old" }),
      token({ number: 3, code: "c", createdAt: "old" }),
    ],
    [
      token({ number: 2, code: "b", createdAt: "new" }),
      token({ number: 1, code: "a", createdAt: "new" }),
    ],
  ]);
  assert.deepEqual(
    merged.map(({ number }) => number),
    [3, 2, 1]
  );
  assert.equal(merged.find(({ code }) => code === "a")?.createdAt, "new");
});
