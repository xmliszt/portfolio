import assert from "node:assert/strict";
import { test } from "node:test";

import { COPY } from "@/lib/paws/copy";

import { readMeowOutcome } from "./read-meow-outcome";

test("lets a cat in with its new or kept sound and no message", () => {
  for (const kind of ["generated", "reused", "alreadyHasMeow"] as const) {
    assert.deepEqual(readMeowOutcome({ kind, meowUrl: "/m.mp3" }), {
      kind: "ready",
      meowUrl: "/m.mp3",
      message: undefined,
      canTryAgain: false,
    });
  }
});

test("lets a cat in with a borrowed meow, and only offers another try after a failure", () => {
  assert.deepEqual(readMeowOutcome({ kind: "borrowed", meowUrl: "/b.mp3" }), {
    kind: "ready",
    meowUrl: "/b.mp3",
    message: COPY.meowResult.borrowed,
    canTryAgain: false,
  });
  assert.deepEqual(readMeowOutcome({ kind: "failed", meowUrl: "/b.mp3" }), {
    kind: "ready",
    meowUrl: "/b.mp3",
    message: COPY.meowResult.failed,
    canTryAgain: true,
  });
  assert.deepEqual(readMeowOutcome({ kind: "tooManyAttempts" }), {
    kind: "ready",
    meowUrl: undefined,
    message: COPY.meowResult.tooManyAttempts,
    canTryAgain: false,
  });
});

test("asks for another sound after a refusal", () => {
  assert.deepEqual(readMeowOutcome({ kind: "refusedByUs" }), {
    kind: "tryAnother",
    message: COPY.meowResult.refusedByUs,
  });
  assert.deepEqual(readMeowOutcome({ kind: "refusedByProvider" }), {
    kind: "tryAnother",
    message: COPY.meowResult.refusedByProvider,
  });
  assert.deepEqual(readMeowOutcome({ kind: "signInRequired" }), {
    kind: "signInRequired",
  });
});
