import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { sceneConfig } from "@/lib/laundromat/scene-config";

test("append_doodle reserves the drawing space the notebook shows", () => {
  const spaceLines = sceneConfig.notebook.doodle.maxRows + 1;
  for (const path of [
    "supabase/schemas/laundro_cafe/append_doodle.sql",
    "supabase/migrations/20261018120000_laundromat_doodle_entries.sql",
  ]) {
    assert.match(
      readFileSync(path, "utf8"),
      new RegExp(`v_space_lines constant integer := ${spaceLines};`),
      path
    );
  }
});
