import assert from "node:assert/strict";
import { test } from "node:test";

import { getNotebookLock } from "./get-notebook-lock";

function buildLock(options: {
  writerSessionId?: string;
  isOwnWriting?: boolean;
  isConnecting?: boolean;
  isConnected?: boolean;
  isSynced?: boolean;
  isUrgentReady?: boolean;
  isDown?: boolean;
}) {
  return getNotebookLock({
    writerSessionId: options.writerSessionId,
    ownSessionId: "own",
    isOwnWriting: options.isOwnWriting ?? false,
    room: {
      isConnecting: options.isConnecting ?? false,
      isConnected: options.isConnected ?? true,
      isSynced: options.isSynced ?? true,
      isUrgentReady: options.isUrgentReady ?? true,
      isDown: options.isDown ?? false,
      drafts: {},
    },
  }).kind;
}

test("another tab writing takes the notebook", () => {
  assert.equal(buildLock({ writerSessionId: "other" }), "taken");
});

test("a synced tab with a free urgent slot can write", () => {
  assert.equal(buildLock({}), "free");
  assert.equal(buildLock({ writerSessionId: "own" }), "free");
});

test("the notebook waits for the first connection, the first sync and a free urgent slot", () => {
  assert.equal(
    buildLock({ isConnecting: true, isConnected: false, isSynced: false }),
    "joining"
  );
  assert.equal(buildLock({ isSynced: false }), "joining");
  assert.equal(buildLock({ isUrgentReady: false }), "joining");
});

test("a tab already writing keeps writing while it waits", () => {
  assert.equal(buildLock({ isOwnWriting: true, isUrgentReady: false }), "free");
});

test("the notebook stays writable when the room is down or absent", () => {
  assert.equal(
    buildLock({ isConnected: false, isSynced: false, isUrgentReady: false }),
    "free"
  );
});

test("a claim seen before the room went down stops blocking once it is down", () => {
  const disconnected = {
    writerSessionId: "other",
    isConnected: false,
    isSynced: false,
    isUrgentReady: false,
  };
  assert.equal(buildLock(disconnected), "taken");
  assert.equal(buildLock({ ...disconnected, isDown: true }), "free");
});
