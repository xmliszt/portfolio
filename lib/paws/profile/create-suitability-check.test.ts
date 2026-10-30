import assert from "node:assert/strict";
import { test } from "node:test";

import { createSuitabilityCheck } from "./create-suitability-check";
import type { MeowProvidersConfig } from "./read-meow-providers-config";

function respondWith(text: string): typeof fetch {
  return async () =>
    Response.json({
      output: [
        { type: "reasoning", summary: [] },
        { type: "message", content: [{ type: "output_text", text }] },
      ],
    });
}

test("the fake check rejects only its test words", async () => {
  const check = createSuitabilityCheck({ config: { kind: "fake" }, fetch });
  assert.equal(await check.isSuitable("unsuitable noise"), false);
  assert.equal(await check.isSuitable("tiny fart"), true);
});

test("the OpenAI check posts to the Responses API with the model and a JSON verdict format", async () => {
  const sent: { url: string; body: unknown }[] = [];
  const fakeFetch: typeof fetch = async (input, init) => {
    sent.push({ url: String(input), body: JSON.parse(String(init?.body)) });
    return respondWith('{"harmless":false}')(input, init);
  };
  const check = createSuitabilityCheck({
    config: { kind: "openai", apiKey: "sk", model: "gpt-5.4-nano" },
    fetch: fakeFetch,
  });
  assert.equal(await check.isSuitable("cat says hi"), false);
  assert.equal(sent.at(0)?.url, "https://api.openai.com/v1/responses");
  const body = sent.at(0)?.body;
  assert.ok(typeof body === "object" && body !== null && "model" in body && "input" in body);
  assert.equal(body.model, "gpt-5.4-nano");
  assert.equal(body.input, "cat says hi");
});

test("the OpenAI check reads a harmless verdict and throws on a malformed one", async () => {
  const config: MeowProvidersConfig["suitability"] = { kind: "openai", apiKey: "sk", model: "m" };
  assert.equal(await createSuitabilityCheck({ config, fetch: respondWith('{"harmless":true}') }).isSuitable("mew"), true);
  await assert.rejects(createSuitabilityCheck({ config, fetch: respondWith('{"ok":1}') }).isSuitable("mew"));
  await assert.rejects(
    createSuitabilityCheck({ config, fetch: async () => new Response("no", { status: 403 }) }).isSuitable("mew")
  );
});
