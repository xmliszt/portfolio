import type { ModerationCheck } from "./meow-pipeline-types";
import type { MeowProvidersConfig } from "./read-meow-providers-config";

const MODERATION_URL = "https://api.openai.com/v1/moderations";
const TIMEOUT_MS = 8_000;
const FAKE_FLAGGED_WORDS = ["scream", "flagme"];

function readFlagged(body: unknown) {
  if (typeof body !== "object" || body === null || !("results" in body) || !Array.isArray(body.results)) {
    throw new Error("Unexpected moderation response");
  }
  const result: unknown = body.results.at(0);
  if (typeof result !== "object" || result === null || !("flagged" in result) || typeof result.flagged !== "boolean") {
    throw new Error("Unexpected moderation result");
  }
  return result.flagged;
}

/** Return the moderation check for `config`: OpenAI's free `omni-moderation-latest` endpoint, or a fake that flags a few test words. */
export function createModerationCheck(options: {
  config: MeowProvidersConfig["moderation"];
  fetch: typeof fetch;
}): ModerationCheck {
  const config = options.config;
  switch (config.kind) {
    case "openai":
      return {
        isFlagged: async (text) => {
          const response = await options.fetch(MODERATION_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
          });
          if (!response.ok) throw new Error(`Moderation ${response.status}: ${await response.text()}`);
          return readFlagged(await response.json());
        },
      };
    case "fake":
      return { isFlagged: async (text) => FAKE_FLAGGED_WORDS.some((word) => text.includes(word)) };
    default: {
      const unknownConfig: never = config;
      throw new Error(`Unknown moderation config ${String(unknownConfig)}`);
    }
  }
}
