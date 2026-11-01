import assert from "node:assert/strict";
import { test } from "node:test";

import { toInlineKeyboard } from "./to-inline-keyboard";

test("maps link and callback buttons to one keyboard row", () => {
  assert.deepEqual(
    toInlineKeyboard([
      { kind: "callback", text: "Skip", data: "skip:p" },
      { kind: "url", text: "Open composer", url: "https://cc.example/c" },
    ]),
    {
      inline_keyboard: [
        [
          { text: "Skip", callback_data: "skip:p" },
          { text: "Open composer", url: "https://cc.example/c" },
        ],
      ],
    }
  );
});

test("returns no keyboard for no buttons", () => {
  assert.equal(toInlineKeyboard([]), undefined);
});
