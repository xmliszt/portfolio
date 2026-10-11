import assert from "node:assert/strict";
import { test } from "node:test";

import { getShelfBookOutline } from "./get-shelf-book-outline";
import { getShelfBookPlacements } from "./get-shelf-book-placements";

const shelf = {
  position: { x: 0, y: 0.8, z: 3.6 },
  size: { w: 0.8, d: 2.4, h: 1.6 },
};

test("places one book per filled notebook, left to right without overlap", () => {
  const books = getShelfBookPlacements({
    shelf,
    bookNumbers: [1, 2, 3],
    lean: 0,
  });
  assert.deepEqual(
    books.map(({ number }) => number),
    [1, 2, 3]
  );
  books.slice(1).forEach((book, index) => {
    const previous = books[index];
    assert.ok(book.y >= previous.y + previous.thickness, `book ${book.number}`);
  });
});

test("keeps every book on the shelf board and below the shelf height", () => {
  const books = getShelfBookPlacements({
    shelf,
    bookNumbers: [1, 2, 3, 4, 5, 6],
    lean: 0.14,
  });
  for (const book of books) {
    assert.ok(book.y >= shelf.position.y);
    assert.ok(book.y + book.thickness <= shelf.position.y + shelf.size.d);
    assert.ok(book.z1 <= shelf.position.z + shelf.size.h);
  }
});

test("keeps only the newest books when more are filled than fit", () => {
  const numbers = Array.from({ length: 40 }, (_, index) => index + 1);
  const books = getShelfBookPlacements({
    shelf,
    bookNumbers: numbers,
    lean: 0.14,
  });
  assert.ok(books.length < 40);
  assert.equal(books.at(-1)?.number, 40);
  assert.equal(books.at(-1)?.lean, 0.14);
});

test("draws nothing on an empty shelf", () => {
  assert.deepEqual(
    getShelfBookPlacements({ shelf, bookNumbers: [], lean: 0.14 }),
    []
  );
});

test("outlines a shelf book inside the screen bounds it reports", () => {
  const [book] = getShelfBookPlacements({ shelf, bookNumbers: [7], lean: 0 });
  const { outline, bounds } = getShelfBookOutline({
    book,
    projection: { unit: 40, origin: { x: 300, y: 200 } },
  });
  assert.equal(outline.length, 6);
  for (const point of outline) {
    assert.ok(point.x >= bounds.x && point.x <= bounds.x + bounds.width);
    assert.ok(point.y >= bounds.y && point.y <= bounds.y + bounds.height);
  }
  assert.ok(bounds.width > 0 && bounds.height > 0);
});
