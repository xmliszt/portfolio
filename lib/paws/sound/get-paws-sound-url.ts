import { getBorrowedMeowUrl } from "@/lib/paws/profile/get-borrowed-meow-url";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { hashUserId } from "./hash-user-id";
import type { PawsSound } from "./paws-sound";

/** Return the clip URL for a cat's sound: the recorded meow for its `voice`, the shared lick clip, or one of the two shared trill or purr clips picked by `userId`. */
export function getPawsSoundUrl(options: {
  sound: PawsSound;
  userId: string;
  voice: VoiceSettings;
}) {
  switch (options.sound) {
    case "meow":
      return getBorrowedMeowUrl(options.voice);
    case "lick":
      return "/paws/sounds/lick.mp3";
    case "trill":
    case "purr":
      return `/paws/sounds/${options.sound}-${hashUserId(options.userId) < 0.5 ? 1 : 2}.mp3`;
    default: {
      const unknownSound: never = options.sound;
      throw new Error(`Unknown paws sound ${String(unknownSound)}`);
    }
  }
}
