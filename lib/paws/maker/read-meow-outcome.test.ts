import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/paws/i18n/copy/en";

import { readMeowOutcome } from "./read-meow-outcome";

test("lets a cat in with its new or kept sound and no message", () => {
  for (const kind of ["generated", "reused", "alreadyHasMeow"] as const) {
    assert.deepEqual(
      readMeowOutcome({ response: { kind, meowUrl: "/m.mp3" }, copy: en }),
      {
        kind: "ready",
        meowUrl: "/m.mp3",
        message: undefined,
        canTryAgain: false,
      }
    );
  }
});

test("lets a cat in with a borrowed meow, and only offers another try after a failure", () => {
  assert.deepEqual(
    readMeowOutcome({
      response: { kind: "borrowed", meowUrl: "/b.mp3" },
      copy: en,
    }),
    {
      kind: "ready",
      meowUrl: "/b.mp3",
      message: en.meowResult.borrowed,
      canTryAgain: false,
    }
  );
  assert.deepEqual(
    readMeowOutcome({
      response: { kind: "failed", meowUrl: "/b.mp3" },
      copy: en,
    }),
    {
      kind: "ready",
      meowUrl: "/b.mp3",
      message: en.meowResult.failed,
      canTryAgain: true,
    }
  );
  assert.deepEqual(
    readMeowOutcome({ response: { kind: "tooManyAttempts" }, copy: en }),
    {
      kind: "ready",
      meowUrl: undefined,
      message: en.meowResult.tooManyAttempts,
      canTryAgain: false,
    }
  );
});

test("asks for another sound after a refusal", () => {
  assert.deepEqual(
    readMeowOutcome({ response: { kind: "refusedByUs" }, copy: en }),
    {
      kind: "tryAnother",
      message: en.meowResult.refusedByUs,
    }
  );
  assert.deepEqual(
    readMeowOutcome({ response: { kind: "refusedByProvider" }, copy: en }),
    {
      kind: "tryAnother",
      message: en.meowResult.refusedByProvider,
    }
  );
  assert.deepEqual(
    readMeowOutcome({ response: { kind: "signInRequired" }, copy: en }),
    {
      kind: "signInRequired",
    }
  );
});
