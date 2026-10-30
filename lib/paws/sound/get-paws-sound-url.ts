import { hashUserId } from "./hash-user-id";
import type { PawsSound } from "./paws-sound";

/** Return the clip URL for a cat's sound: its `meowUrl` for a meow, or one of the two shared trill or purr clips picked by `userId`. */
export function getPawsSoundUrl(options: { sound: PawsSound; userId: string; meowUrl: string }) {
  switch (options.sound) {
    case "meow":
      return options.meowUrl;
    case "trill":
    case "purr":
      return `/paws/sounds/${options.sound}-${hashUserId(options.userId) < 0.5 ? 1 : 2}.mp3`;
    default: {
      const unknownSound: never = options.sound;
      throw new Error(`Unknown paws sound ${String(unknownSound)}`);
    }
  }
}
