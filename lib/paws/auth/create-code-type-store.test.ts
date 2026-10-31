import assert from "node:assert/strict";
import { test } from "node:test";

import { createCodeTypeStore } from "./create-code-type-store";

function buildStorage() {
  const items: { [key: string]: string } = {};
  return {
    getItem: (key: string) => items[key] ?? null,
    setItem: (key: string, value: string) => {
      items[key] = value;
    },
  };
}

test("remembers the code type per email across stores on the same storage", () => {
  const storage = buildStorage();
  createCodeTypeStore({ storage: () => storage }).set({
    email: "a@b.c",
    codeType: "email_change",
  });
  const reloaded = createCodeTypeStore({ storage: () => storage });
  assert.equal(reloaded.get("a@b.c"), "email_change");
  assert.equal(reloaded.get("x@y.z"), undefined);
});

test("behaves as empty when storage is unavailable or holds junk", () => {
  const broken = createCodeTypeStore({
    storage: () => {
      throw new Error("blocked");
    },
  });
  broken.set({ email: "a@b.c", codeType: "email" });
  assert.equal(broken.get("a@b.c"), undefined);
  const storage = buildStorage();
  storage.setItem("paws-email-code-types", '{"a@b.c":"sms"}');
  assert.equal(
    createCodeTypeStore({ storage: () => storage }).get("a@b.c"),
    undefined
  );
});
