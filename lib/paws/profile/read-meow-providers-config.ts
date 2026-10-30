export type MeowProvidersConfig = {
  moderation: { kind: "openai"; apiKey: string } | { kind: "fake" };
  suitability: { kind: "openai"; apiKey: string; model: string } | { kind: "fake" };
  generator: { kind: "elevenLabs"; apiKey: string } | { kind: "fake" };
  dailyCredits: number;
  hashSecret: string;
};

const DEFAULT_DAILY_CREDITS = 600;
const DEV_HASH_SECRET = "paws-dev-hash-secret";

function readSet(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === "" ? undefined : trimmed;
}

/** Return which meow providers to use from `env`: the real ones when their keys are set, the fake ones otherwise. */
export function readMeowProvidersConfig(env: { [name: string]: string | undefined }): MeowProvidersConfig {
  const openAiKey = readSet(env.OPENAI_API_KEY_PAWS);
  const openAiModel = readSet(env.OPENAI_PAWS_MODEL);
  const elevenLabsKey = readSet(env.ELEVENLABS_API_KEY);
  const dailyCredits = Number.parseInt(env.PAWS_DAILY_CREDITS ?? "", 10);
  return {
    moderation: openAiKey === undefined ? { kind: "fake" } : { kind: "openai", apiKey: openAiKey },
    suitability:
      openAiKey === undefined || openAiModel === undefined
        ? { kind: "fake" }
        : { kind: "openai", apiKey: openAiKey, model: openAiModel },
    generator: elevenLabsKey === undefined ? { kind: "fake" } : { kind: "elevenLabs", apiKey: elevenLabsKey },
    dailyCredits: Number.isFinite(dailyCredits) && dailyCredits >= 0 ? dailyCredits : DEFAULT_DAILY_CREDITS,
    hashSecret: readSet(env.PAWS_HASH_SECRET) ?? DEV_HASH_SECRET,
  };
}
