import assert from "node:assert/strict";
import { test } from "node:test";

import { createCaptchaTokens } from "./create-captcha-tokens";

function buildTokens() {
  const timers: { all: (() => void)[] } = { all: [] };
  const tokens = createCaptchaTokens({
    timeoutMs: 1000,
    schedule: ({ run }) => {
      timers.all = [...timers.all, run];
      return () => {
        timers.all = timers.all.filter((candidate) => candidate !== run);
      };
    },
  });
  return { tokens, timers };
}

test("hands over a kept token once and asks for a fresh one", async () => {
  const { tokens } = buildTokens();
  const taken: { count: number } = { count: 0 };
  tokens.onTaken(() => {
    taken.count += 1;
  });
  tokens.put("a");
  assert.equal(await tokens.take(), "a");
  assert.equal(taken.count, 1);
  tokens.put("b");
  tokens.clear();
  const waiting = tokens.take();
  tokens.put("c");
  assert.equal(await waiting, "c");
  assert.equal(taken.count, 2);
});

test("gives up with no token after the timeout", async () => {
  const { tokens, timers } = buildTokens();
  const waiting = tokens.take();
  timers.all.forEach((run) => run());
  assert.equal(await waiting, undefined);
  tokens.put("late");
  assert.equal(await tokens.take(), "late");
});
