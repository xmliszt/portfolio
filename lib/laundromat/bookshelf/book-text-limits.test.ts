import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { REPORT_HIDE_THRESHOLD } from "@/lib/laundromat/notebook/report-hide-threshold";

import { BOOK_TEXT_LIMITS } from "./book-text-limits";

const SQL_FILES = [
  "supabase/schemas/laundro_cafe/recommend_book.sql",
  "supabase/migrations/20261113120000_laundromat_bookshelf.sql",
];

test("recommend_book enforces BOOK_TEXT_LIMITS for notes and sign-offs", () => {
  for (const path of SQL_FILES) {
    const sql = readFileSync(path, "utf8");
    assert.match(
      sql,
      new RegExp(`char_length\\(v_body\\) > ${BOOK_TEXT_LIMITS.note}\\b`),
      path
    );
    assert.match(
      sql,
      new RegExp(
        `char_length\\(v_sign_off\\) > ${BOOK_TEXT_LIMITS.signOff}\\b`
      ),
      path
    );
  }
});

test("count_book_note_report hides a note at REPORT_HIDE_THRESHOLD reports, like notebook entries", () => {
  for (const path of [
    "supabase/schemas/laundro_cafe/count_book_note_report.sql",
    "supabase/migrations/20261113120000_laundromat_bookshelf.sql",
  ]) {
    assert.match(
      readFileSync(path, "utf8"),
      new RegExp(`report_count \\+ 1 >= ${REPORT_HIDE_THRESHOLD}\\b`),
      path
    );
  }
});

test("the books table limits title, subtitle and authors to BOOK_TEXT_LIMITS", () => {
  const sql = readFileSync("supabase/schemas/laundro_cafe/books.sql", "utf8");
  for (const column of ["title", "subtitle", "authors"] as const) {
    assert.match(
      sql,
      new RegExp(
        `char_length\\("${column}"\\) between 1 and ${BOOK_TEXT_LIMITS[column]}\\)`
      ),
      column
    );
  }
});
