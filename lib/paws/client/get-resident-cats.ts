import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { shuffleVoice } from "@/lib/paws/maker/shuffle-voice";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { hashUserId } from "@/lib/paws/sound/hash-user-id";
import type { PlayerPresence } from "@/lib/paws/wire-types";

/** Return the room's resident cats, the same looks and voices on every screen for the same `roomId`. */
export function getResidentCats(options: {
  roomId: string;
}): Pick<PlayerPresence, "userId" | "look" | "voice">[] {
  const random = createSeededRandom({
    seed: hashUserId(options.roomId) * 2 ** 32,
  });
  return Array.from({ length: ROOM_LIMITS.residentCats }, (_, index) => ({
    userId: `resident-${index + 1}`,
    voice: shuffleVoice({ random }),
    look: shuffleCatLook({ random }),
  }));
}
