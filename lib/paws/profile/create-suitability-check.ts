import type { SuitabilityCheck } from "./meow-pipeline-types";
import type { MeowProvidersConfig } from "./read-meow-providers-config";

const RESPONSES_URL = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 15_000;
const FAKE_UNSUITABLE_WORDS = ["unsuitable", "gibberish words"];
const INSTRUCTIONS =
  "You check sound requests for a cozy shared room where small cats make one short sound each. " +
  "The user text describes the sound a cat makes. Answer harmless=true only if it is a harmless short sound effect: " +
  "no speech or words, no screams, gunshots, sexual or distressing sounds. Silly sounds like farts, burps or sneezes are fine.";
const VERDICT_FORMAT = {
  type: "json_schema",
  name: "sound_verdict",
  strict: true,
  schema: {
    type: "object",
    properties: { harmless: { type: "boolean" } },
    required: ["harmless"],
    additionalProperties: false,
  },
};

function isRecord(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

function readOutputText(body: unknown) {
  const output =
    isRecord(body) && Array.isArray(body.output) ? body.output : [];
  const texts = output
    .filter(isRecord)
    .filter((item) => item.type === "message" && Array.isArray(item.content))
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter(isRecord)
    .filter(
      (part) => part.type === "output_text" && typeof part.text === "string"
    )
    .map((part) => String(part.text));
  const text = texts.at(0);
  if (text === undefined)
    throw new Error("Suitability response had no output text");
  return text;
}

function readHarmless(text: string) {
  const verdict: unknown = JSON.parse(text);
  if (!isRecord(verdict) || typeof verdict.harmless !== "boolean") {
    throw new Error(`Unexpected suitability verdict: ${text}`);
  }
  return verdict.harmless;
}

/** Return the suitability check for `config`: one OpenAI Responses API call to a small model, or a fake that rejects a few test words. */
export function createSuitabilityCheck(options: {
  config: MeowProvidersConfig["suitability"];
  fetch: typeof fetch;
}): SuitabilityCheck {
  const config = options.config;
  switch (config.kind) {
    case "openai":
      return {
        isSuitable: async (text) => {
          const response = await options.fetch(RESPONSES_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: config.model,
              instructions: INSTRUCTIONS,
              input: text,
              text: { format: VERDICT_FORMAT },
              store: false,
            }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
          });
          if (!response.ok)
            throw new Error(
              `Suitability ${response.status}: ${await response.text()}`
            );
          return readHarmless(readOutputText(await response.json()));
        },
      };
    case "fake":
      return {
        isSuitable: async (text) =>
          !FAKE_UNSUITABLE_WORDS.some((word) => text.includes(word)),
      };
    default: {
      const unknownConfig: never = config;
      throw new Error(`Unknown suitability config ${String(unknownConfig)}`);
    }
  }
}
