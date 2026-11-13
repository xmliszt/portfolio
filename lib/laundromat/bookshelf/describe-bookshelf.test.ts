import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeBookshelf } from "./describe-bookshelf";

test("describeBookshelf is ready only once online, with the empty tooltip when there are no books", () => {
  assert.equal(
    describeBookshelf({ state: "loading", bookCount: 0, copy: en }).ready,
    false
  );
  assert.equal(
    describeBookshelf({ state: "offline", bookCount: 0, copy: en }).ready,
    false
  );
  assert.deepEqual(
    describeBookshelf({ state: "online", bookCount: 0, copy: en }),
    {
      label: en.bookshelf.readyLabel,
      tooltip: en.bookshelf.emptyTooltip,
      ready: true,
    }
  );
  assert.equal(
    describeBookshelf({ state: "online", bookCount: 3, copy: en }).tooltip,
    en.bookshelf.readyTooltip
  );
});
