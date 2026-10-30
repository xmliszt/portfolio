import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { getMeowUrl } from "./get-meow-url";
import { hashUserId } from "./hash-user-id";
import type { PawsSound } from "./paws-sound";

/** Return the clip URL for a cat's sound: the recorded meow for its `voice`, the shared lick clip, or one of the two shared purr clips picked by `userId`. */
export function getPawsSoundUrl(options: {
  sound: PawsSound;
  userId: string;
  voice: VoiceSettings;
}) {
  switch (options.sound) {
    case "meow":
      return getMeowUrl(options.voice);
    case "lick":
      return "/paws/sounds/lick.mp3";
    case "purr":
      return `/paws/sounds/purr-${hashUserId(options.userId) < 0.5 ? 1 : 2}.mp3`;
    default: {
      const unknownSound: never = options.sound;
      throw new Error(`Unknown paws sound ${String(unknownSound)}`);
    }
  }
}
