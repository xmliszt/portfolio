import {
  AGES,
  MOODS,
  VOICES,
  type VoiceSettings,
} from "@/lib/paws/voice-settings";

const isOneOf = <T extends string>(
  options: readonly T[],
  value: unknown
): value is T => options.some((option) => option === value);

/** Return the voice settings in `value`, or `undefined` when any field is missing or not one of the offered options. */
export function parseVoiceSettings(value: unknown): VoiceSettings | undefined {
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
