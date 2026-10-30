import assert from "node:assert/strict";
import { test } from "node:test";

import { createModerationCheck } from "./create-moderation-check";

test("the fake check flags only its test words", async () => {
  const check = createModerationCheck({ config: { kind: "fake" }, fetch });
  assert.equal(await check.isFlagged("little scream"), true);
  assert.equal(await check.isFlagged("meow"), false);
});

test("the OpenAI check posts the text and reads the first result", async () => {
  const sent: { url: string; body: unknown; auth: string | null }[] = [];
  const fakeFetch: typeof fetch = async (input, init) => {
    sent.push({
      url: String(input),
      body: JSON.parse(String(init?.body)),
      auth: new Headers(init?.headers).get("authorization"),
    });
    return Response.json({ results: [{ flagged: true }] });
  };
  const check = createModerationCheck({
    config: { kind: "openai", apiKey: "sk" },
    fetch: fakeFetch,
  });
  assert.equal(await check.isFlagged("meow"), true);
  assert.deepEqual(sent, [
    {
      url: "https://api.openai.com/v1/moderations",
      body: { model: "omni-moderation-latest", input: "meow" },
      auth: "Bearer sk",
    },
  ]);
});

test("the OpenAI check throws on an error status", async () => {
  const check = createModerationCheck({
    config: { kind: "openai", apiKey: "sk" },
    fetch: async () => new Response("down", { status: 500 }),
  });
  await assert.rejects(check.isFlagged("meow"));
});
