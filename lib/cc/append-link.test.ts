import assert from "node:assert/strict";
import { test } from "node:test";

import { appendLink } from "./append-link";

test("adds the link on its own line unless the text has it", () => {
  assert.equal(
    appendLink({
      text: "New first line ",
      link: "https://x.com/i/web/status/1",
    }),
    "New first line\n\nhttps://x.com/i/web/status/1"
  );
  assert.equal(
    appendLink({
      text: "see https://x.com/i/web/status/1",
      link: "https://x.com/i/web/status/1",
    }),
    "see https://x.com/i/web/status/1"
  );
  assert.equal(appendLink({ text: "", link: "https://a.b" }), "https://a.b");
});
