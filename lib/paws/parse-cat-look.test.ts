import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./sim/testing/build-look";
import { parseCatLook } from "./parse-cat-look";

test("reads a look saved without a tail shape as a slim tail", () => {
  const { tailShape: _, ...saved } = buildLook({ tailShape: "hook" });
  assert.deepEqual(parseCatLook(saved), buildLook({ tailShape: "slim" }));
});

test("reads a look with an unknown tail shape as a slim tail", () => {
  assert.deepEqual(
    parseCatLook({ ...buildLook(), tailShape: "curly" }),
    buildLook({ tailShape: "slim" })
  );
});
