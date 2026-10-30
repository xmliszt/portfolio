import { parseCatLook } from "@/lib/paws/parse-cat-look";
import {
  AGES,
  MOODS,
  VOICES,
  type VoiceSettings,
} from "@/lib/paws/voice-settings";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { parseWireId } from "./parse-wire-id";
import { WIRE_LIMITS } from "./wire-limits";

const isOneOf = <T extends string>(
  options: readonly T[],
  value: unknown
): value is T => options.some((option) => option === value);

function parseVoice(value: unknown): VoiceSettings | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("age" in value && isOneOf(AGES, value.age)) ||
    !("voice" in value && isOneOf(VOICES, value.voice)) ||
    !("mood" in value && isOneOf(MOODS, value.mood))
  ) {
    return undefined;
  }
  return { age: value.age, voice: value.voice, mood: value.mood };
}

function parseMeowUrl(options: { value: unknown; meowOrigins: string[] }) {
  const { value } = options;
  if (typeof value !== "string" || value.length > WIRE_LIMITS.maxUrlLength)
    return undefined;
  const isSameSitePath =
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\");
  const isFromMeowOrigin = options.meowOrigins.some((origin) =>
    value.startsWith(`${origin}/`)
  );
  return isSameSitePath || isFromMeowOrigin ? value : undefined;
}

/** Return the presence another player tracked on the room channel, or `undefined` when any field is missing or malformed, or `meowUrl` is neither a same-site path nor under one of `meowOrigins`. */
export function parsePlayerPresence(options: {
  value: unknown;
  meowOrigins: string[];
}): PlayerPresence | undefined {
  const { value } = options;
  if (typeof value !== "object" || value === null) return undefined;
  const userId = "userId" in value ? parseWireId(value.userId) : undefined;
  const look = "look" in value ? parseCatLook(value.look) : undefined;
  const voice = "voice" in value ? parseVoice(value.voice) : undefined;
  const meowUrl =
    "meowUrl" in value
      ? parseMeowUrl({ value: value.meowUrl, meowOrigins: options.meowOrigins })
      : undefined;
  if (
    userId === undefined ||
    look === undefined ||
    voice === undefined ||
    meowUrl === undefined ||
    !(
      "joinedAt" in value &&
      typeof value.joinedAt === "number" &&
      Number.isFinite(value.joinedAt)
    )
  ) {
    return undefined;
  }
  return { userId, look, voice, meowUrl, joinedAt: value.joinedAt };
}
