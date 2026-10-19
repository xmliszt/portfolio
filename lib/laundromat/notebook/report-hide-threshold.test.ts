import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { REPORT_HIDE_THRESHOLD } from "./report-hide-threshold";

const SQL_FILES = [
  "supabase/schemas/laundro_cafe/count_entry_report.sql",
  "supabase/migrations/20261013120000_laundromat_auto_hide_reported_entries.sql",
];

test("count_entry_report hides an entry at REPORT_HIDE_THRESHOLD reports", () => {
  for (const path of SQL_FILES) {
    assert.match(
      readFileSync(path, "utf8"),
      new RegExp(`report_count \\+ 1 >= ${REPORT_HIDE_THRESHOLD}\\b`),
      path
    );
  }
});
