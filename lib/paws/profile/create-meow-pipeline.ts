import type { MeowRequest } from "@/lib/paws/meow-api-types";
import type { RequestUser } from "@/lib/paws/supabase/read-request-user";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { getBorrowedMeowUrl } from "./get-borrowed-meow-url";
import { getMeowKey } from "./get-meow-key";
import { getMeowPrompt } from "./get-meow-prompt";
import { getUtcDay } from "./get-utc-day";
import { hashIp } from "./hash-ip";
import { isBlocklistedMeowText } from "./is-blocklisted-meow-text";
import type {
  GenerateResult,
  MeowAttemptOutcome,
  MeowPipelineDependencies,
  MeowPipelineResult,
} from "./meow-pipeline-types";
import { normalizeMeowText } from "./normalize-meow-text";
import { parseVoiceSettings } from "./parse-voice-settings";

const CREDITS_PER_CLIP = 60;
const MAX_REFUSALS_PER_DAY = 5;
const MAX_GENERATIONS_PER_IP_PER_DAY = 3;

/** Return a meow pipeline that runs one meow request through the account, attempt, cache, safety, budget and generation steps in order. */
export function createMeowPipeline(deps: MeowPipelineDependencies) {
  async function checkAndGenerate(options: {
    userId: string;
    ipHash: string;
    normalizedText: string;
    voice: VoiceSettings;
    day: string;
  }): Promise<{ outcome: MeowAttemptOutcome; credits: number; result: MeowPipelineResult }> {
    const borrowedUrl = getBorrowedMeowUrl(options.voice);
    if (isBlocklistedMeowText(options.normalizedText)) {
      return { outcome: "refusedByUs", credits: 0, result: { kind: "refusedByUs" } };
    }
    try {
      if (await deps.moderation.isFlagged(options.normalizedText)) {
        return { outcome: "refusedByUs", credits: 0, result: { kind: "refusedByUs" } };
      }
      if (!(await deps.suitability.isSuitable(options.normalizedText))) {
        return { outcome: "refusedByUs", credits: 0, result: { kind: "refusedByUs" } };
      }
    } catch (error) {
      deps.log("paws meow check failed", error);
      return { outcome: "failed", credits: 0, result: { kind: "failed", meowUrl: borrowedUrl } };
    }

    const isReserved = await deps.budget.reserve({ day: options.day, amount: CREDITS_PER_CLIP });
    if (!isReserved) {
      return { outcome: "borrowed", credits: 0, result: { kind: "borrowed", meowUrl: borrowedUrl } };
    }

    const generated = await deps.generator
      .generate({ prompt: getMeowPrompt(options), voice: options.voice })
      .catch((error: unknown): GenerateResult => ({ kind: "failed", detail: String(error) }));
    switch (generated.kind) {
      case "refused":
        deps.log("paws meow refused by provider", { status: generated.status, body: generated.body });
        await deps.budget.release({ day: options.day, amount: CREDITS_PER_CLIP });
        return { outcome: "refusedByProvider", credits: 0, result: { kind: "refusedByProvider" } };
      case "failed":
        deps.log("paws meow generation failed", generated.detail);
        await deps.budget.release({ day: options.day, amount: CREDITS_PER_CLIP });
        return { outcome: "failed", credits: 0, result: { kind: "failed", meowUrl: borrowedUrl } };
      case "audio":
        break;
      default: {
        const unknownKind: never = generated;
        throw new Error(`Unknown generate result ${String(unknownKind)}`);
      }
    }

    const key = getMeowKey(options);
    const storagePath = `meows/${key}.mp3`;
    try {
      await deps.storage.upload({ path: storagePath, bytes: generated.bytes });
      await deps.store.insertMeow({
        key,
        storagePath,
        text: options.normalizedText,
        voice: options.voice,
        createdBy: options.userId,
      });
      await deps.store.assignMeow({ userId: options.userId, meowKey: key, voice: options.voice });
    } catch (error) {
      deps.log("paws meow save failed", error);
      return { outcome: "failed", credits: CREDITS_PER_CLIP, result: { kind: "failed", meowUrl: borrowedUrl } };
    }
    return {
      outcome: "generated",
      credits: CREDITS_PER_CLIP,
      result: { kind: "generated", meowUrl: deps.storage.getPublicUrl(storagePath) },
    };
  }

  async function requestMeow(options: {
    user: RequestUser | undefined;
    ip: string;
    body: unknown;
  }): Promise<MeowPipelineResult> {
    if (options.user === undefined || options.user.isAnonymous) return { kind: "signInRequired" };
    const request = parseMeowRequest(options.body);
    if (request === undefined) return { kind: "invalid" };
    const userId = options.user.userId;

    const cat = await deps.store.findCatMeow({ userId });
    if (cat.kind === "noCat") return { kind: "catNotSaved" };
    if (cat.meow !== undefined) {
      const meowUrl = cat.meow.blocked
        ? getBorrowedMeowUrl(cat.voice)
        : deps.storage.getPublicUrl(cat.meow.storagePath);
      return { kind: "alreadyHasMeow", meowUrl };
    }

    const now = deps.clock.now();
    const day = getUtcDay(now);
    const since = new Date(`${day}T00:00:00.000Z`);
    const ipHash = hashIp({ ip: options.ip, secret: deps.hashSecret });
    if ((await deps.store.countRefusalsSince({ userId, since })) >= MAX_REFUSALS_PER_DAY) {
      return { kind: "tooManyAttempts" };
    }
    if ((await deps.store.countGenerationsSince({ ipHash, since })) >= MAX_GENERATIONS_PER_IP_PER_DAY) {
      return { kind: "tooManyAttempts" };
    }

    const normalizedText = normalizeMeowText(request.text);
    const cached = await deps.store.findMeow({ key: getMeowKey({ normalizedText, voice: request.voice }) });
    if (cached !== undefined) {
      if (cached.blocked) {
        await deps.store.recordAttempt({ userId, ipHash, outcome: "refusedByUs", credits: 0 });
        return { kind: "refusedByUs" };
      }
      await deps.store.assignMeow({ userId, meowKey: cached.key, voice: request.voice });
      await deps.store.recordAttempt({ userId, ipHash, outcome: "reused", credits: 0 });
      return { kind: "reused", meowUrl: deps.storage.getPublicUrl(cached.storagePath) };
    }

    const attempt = await checkAndGenerate({ userId, ipHash, normalizedText, voice: request.voice, day });
    await deps.store.recordAttempt({ userId, ipHash, outcome: attempt.outcome, credits: attempt.credits });
    return attempt.result;
  }

  return { requestMeow };
}

function parseMeowRequest(value: unknown): MeowRequest | undefined {
  if (typeof value !== "object" || value === null || !("text" in value) || typeof value.text !== "string") {
    return undefined;
  }
  const voice = "voice" in value ? parseVoiceSettings(value.voice) : undefined;
  return voice === undefined ? undefined : { text: value.text, voice };
}
