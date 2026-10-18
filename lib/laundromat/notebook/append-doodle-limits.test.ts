import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { sceneConfig } from "@/lib/laundromat/scene-config";

import { DOODLE_LIMITS } from "./doodle-limits";

const SQL_FILES = [
  "supabase/schemas/laundro_cafe/append_doodle.sql",
  "supabase/migrations/20261018120000_laundromat_doodle_entries.sql",
];

test("append_doodle's drawing space is the notebook's doodle rows plus the timestamp line", () => {
  const spaceLines = sceneConfig.notebook.doodle.maxRows + 1;
  for (const path of SQL_FILES) {
    assert.match(
      readFileSync(path, "utf8"),
      new RegExp(`v_space_lines constant integer := ${spaceLines};`),
      path
    );
  }
});

test("append_doodle allows as many strokes as DOODLE_LIMITS", () => {
  for (const path of SQL_FILES) {
    assert.match(
      readFileSync(path, "utf8"),
      new RegExp(`not between 1 and ${DOODLE_LIMITS.maxStrokes}\\b`),
      path
    );
  }
});

test("append_doodle limits the drawing's JSON text, not its stored size", () => {
  for (const path of SQL_FILES) {
    assert.match(
      readFileSync(path, "utf8"),
      /octet_length\(p_drawing::text\) > 32768/,
      path
    );
  }
});
