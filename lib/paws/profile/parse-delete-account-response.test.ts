import assert from "node:assert/strict";
import { test } from "node:test";

import { parseDeleteAccountResponse } from "./parse-delete-account-response";

test("reads every delete account response kind", () => {
  for (const kind of ["deleted", "signInRequired", "failed"] as const)
    assert.deepEqual(parseDeleteAccountResponse({ kind }), { kind });
});

test("drops a value that is not a delete account response", () => {
  assert.equal(parseDeleteAccountResponse(undefined), undefined);
  assert.equal(parseDeleteAccountResponse("deleted"), undefined);
  assert.equal(parseDeleteAccountResponse({ kind: "saved" }), undefined);
});
