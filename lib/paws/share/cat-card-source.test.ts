import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CAT_CARD } from "./cat-card";

const DRAWN_FROM = {
  version: "4",
  hash: "63d8c30f4d08a1340cb83e3ba02deb58dcd0c313eaaab22184da0ea7a0a3c8e0",
};

const SOURCE_DIRS = ["lib/paws/render", "lib/paws/sim"];
const SOURCE_FILES = [
  "lib/paws/cat-look.ts",
  "lib/paws/riso-inks.ts",
  "lib/paws/guide/pose-guide-cat.ts",
  "lib/paws/guide/run-guide-take.ts",
  "lib/paws/share/draw-cat-card.ts",
];

function listSources() {
  const fromDirs = SOURCE_DIRS.flatMap((dir) =>
    readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
      .filter((file) => !file.startsWith("testing/"))
      .map((file) => join(dir, file))
  );
  return [...fromDirs, ...SOURCE_FILES].toSorted();
}

test("raises the card version when the code that draws the card changes", () => {
  const hash = createHash("sha256");
  for (const path of listSources())
    hash.update(path).update(readFileSync(path));
  assert.deepEqual(
    { version: CAT_CARD.version, hash: hash.digest("hex") },
    DRAWN_FROM,
    "The code that draws the cat link preview changed. Link previews are cached forever under CAT_CARD.version: if a cat now looks different, raise CAT_CARD.version in lib/paws/share/cat-card.ts. Then copy the version and the new hash into DRAWN_FROM in this test."
  );
});
