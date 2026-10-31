import { parseCatLook } from "@/lib/paws/parse-cat-look";
import { parseVoiceSettings } from "@/lib/paws/profile/parse-voice-settings";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { parseWireId } from "./parse-wire-id";

/** Return the presence another player tracked on the room channel, or `undefined` when any field is missing or malformed. */
export function parsePlayerPresence(
  value: unknown
): PlayerPresence | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const userId = "userId" in value ? parseWireId(value.userId) : undefined;
  const look = "look" in value ? parseCatLook(value.look) : undefined;
  const connectionId =
    "connectionId" in value ? parseWireId(value.connectionId) : undefined;
  const voice = "voice" in value ? parseVoiceSettings(value.voice) : undefined;
  if (
    userId === undefined ||
    connectionId === undefined ||
    look === undefined ||
    voice === undefined ||
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
    joinedAt: value.joinedAt,
  };
}
