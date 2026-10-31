import {
  AGES,
  MOODS,
  VOICES,
  type VoiceSettings,
} from "@/lib/paws/voice-settings";

import { pickOption } from "./pick-option";

/** Return voice settings with every field drawn from its offered options using `random`. */
export function shuffleVoice(options: { random: () => number }): VoiceSettings {
  const random = options.random;
  return {
    age: pickOption({ options: AGES, random }),
    voice: pickOption({ options: VOICES, random }),
    mood: pickOption({ options: MOODS, random }),
  };
}
