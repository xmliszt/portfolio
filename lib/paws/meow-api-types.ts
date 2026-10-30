import type { VoiceSettings } from "./voice-settings";

export type MeowRequest = { text: string; voice: VoiceSettings };

export type MeowResponse =
  | { kind: "generated"; meowUrl: string }
  | { kind: "reused"; meowUrl: string }
  | { kind: "borrowed"; meowUrl: string }
  | { kind: "refusedByUs" }
  | { kind: "refusedByProvider" }
  | { kind: "failed"; meowUrl: string }
  | { kind: "alreadyHasMeow"; meowUrl: string }
  | { kind: "tooManyAttempts" }
  | { kind: "inProgress" }
  | { kind: "signInRequired" };
