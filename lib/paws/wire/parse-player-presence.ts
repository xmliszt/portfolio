import { parseCatLook } from "@/lib/paws/parse-cat-look";
import { parseVoiceSettings } from "@/lib/paws/profile/parse-voice-settings";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { parseWireId } from "./parse-wire-id";
import { WIRE_LIMITS } from "./wire-limits";

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
  const connectionId =
    "connectionId" in value ? parseWireId(value.connectionId) : undefined;
  const voice = "voice" in value ? parseVoiceSettings(value.voice) : undefined;
  const meowUrl =
    "meowUrl" in value
      ? parseMeowUrl({ value: value.meowUrl, meowOrigins: options.meowOrigins })
      : undefined;
  if (
    userId === undefined ||
    connectionId === undefined ||
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
  return {
    userId,
    connectionId,
    look,
    voice,
    meowUrl,
    joinedAt: value.joinedAt,
  };
}
