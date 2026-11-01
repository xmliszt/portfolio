import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "@/lib/paws/sim/testing/build-look";

import { getInviteUrl } from "./get-invite-url";

test("links the room and the cat in place of the current query", () => {
  assert.equal(
    getInviteUrl({
      href: "https://paws.garden/?fake&room=old#top",
      roomId: "room-1",
      look: buildLook(),
    }),
    "https://paws.garden/?room=room-1&cat=010011101"
  );
});

test("leaves out what the visitor does not have", () => {
  assert.equal(
    getInviteUrl({
      href: "https://paws.garden/?room=old",
      roomId: undefined,
      look: undefined,
    }),
    "https://paws.garden/"
  );
});
