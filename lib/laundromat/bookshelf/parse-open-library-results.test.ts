import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { parseOpenLibraryResults } from "./parse-open-library-results";

function readFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(`lib/laundromat/bookshelf/fixtures/${name}.json`, "utf8")
  );
}

test("parseOpenLibraryResults reads a Korean title and merges author spellings that differ only in case", () => {
  const [first, second] = parseOpenLibraryResults(
    readFixture("open-library-almond")
  );
  assert.deepEqual(first, {
    source: "openlibrary",
    sourceId: "OL20758187W",
    title: "아몬드",
    subtitle: undefined,
    authors: "Won-Pyung Sohn",
    year: 2020,
    language: undefined,
    coverRef: "11654300",
  });
  assert.equal(
    second.year,
    undefined,
    "a work without first_publish_year has no year"
  );
});

test("parseOpenLibraryResults keeps a work whose title comes back in Latin letters", () => {
  const books = parseOpenLibraryResults(
    readFixture("open-library-season-of-migration")
  );
  assert.ok(
    books.some((book) => book.title === "Mawsim al-hijrah ilá al-shamāl")
  );
});

test("parseOpenLibraryResults skips docs without a work id, title or author", () => {
  const books = parseOpenLibraryResults({
    docs: [
      { key: "/books/OL1M", title: "Edition key", author_name: ["A"] },
      { key: "/works/OL2W", author_name: ["A"] },
      { key: "/works/OL3W", title: "No author" },
      { key: "/works/OL4W", title: "  ", author_name: ["A"] },
      { key: "/works/OL5W", title: "Kept", author_name: ["A"] },
    ],
  });
  assert.deepEqual(
    books.map((book) => book.sourceId),
    ["OL5W"]
  );
});

test("parseOpenLibraryResults returns nothing for a response it cannot read", () => {
  assert.deepEqual(parseOpenLibraryResults({ error: "boom" }), []);
  assert.deepEqual(parseOpenLibraryResults(undefined), []);
});

test("parseOpenLibraryResults cuts long titles to the column limit", () => {
  const [book] = parseOpenLibraryResults({
    docs: [{ key: "/works/OL9W", title: "가".repeat(250), author_name: ["A"] }],
  });
  assert.equal([...book.title].length, 200);
});

test("parseOpenLibraryResults keeps the valid docs when one doc is malformed", () => {
  const books = parseOpenLibraryResults({
    docs: [
      { title: "No key", author_name: ["A"] },
      {
        key: "/works/OL5W",
        title: "Bad cover",
        author_name: ["A"],
        cover_i: -1,
      },
      { key: "/works/OL6W", title: "Kept", author_name: ["A"] },
    ],
  });
  assert.deepEqual(
    books.map((book) => book.sourceId),
    ["OL6W"]
  );
});
