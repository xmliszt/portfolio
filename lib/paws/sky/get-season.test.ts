import assert from "node:assert/strict";
import { test } from "node:test";

import { getSeason } from "./get-season";

test("the north and south have opposite seasons", () => {
  assert.equal(getSeason({ latitude: 31.2, month: 9 }), "autumn");
  assert.equal(getSeason({ latitude: -33.9, month: 9 }), "spring");
  assert.equal(getSeason({ latitude: 51.5, month: 0 }), "winter");
  assert.equal(getSeason({ latitude: -33.9, month: 0 }), "summer");
});

test("the tropics have a wet and a dry season instead", () => {
  assert.equal(getSeason({ latitude: 13.7, month: 7 }), "wet");
  assert.equal(getSeason({ latitude: 13.7, month: 1 }), "dry");
  assert.equal(getSeason({ latitude: -6.2, month: 1 }), "wet");
});
