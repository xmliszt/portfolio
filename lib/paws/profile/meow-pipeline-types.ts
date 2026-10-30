import type { MeowResponse } from "@/lib/paws/meow-api-types";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

export type MeowAttemptOutcome = "generated" | "reused" | "borrowed" | "refusedByUs" | "refusedByProvider" | "failed";

export type StoredMeow = { key: string; storagePath: string; blocked: boolean };

export type CatMeowLookup =
  | { kind: "noCat" }
  | { kind: "cat"; voice: VoiceSettings; meow: StoredMeow | undefined };

export type MeowStore = {
  findCatMeow: (options: { userId: string }) => Promise<CatMeowLookup>;
  countRefusalsSince: (options: { userId: string; since: Date }) => Promise<number>;
  countGenerationsSince: (options: { ipHash: string; since: Date }) => Promise<number>;
  findMeow: (options: { key: string }) => Promise<StoredMeow | undefined>;
  insertMeow: (options: {
    key: string;
    storagePath: string;
    text: string;
    voice: VoiceSettings;
    createdBy: string;
  }) => Promise<void>;
  assignMeow: (options: { userId: string; meowKey: string; voice: VoiceSettings }) => Promise<void>;
  recordAttempt: (options: {
    userId: string;
    ipHash: string;
    outcome: MeowAttemptOutcome;
    credits: number;
  }) => Promise<void>;
};

export type ModerationCheck = { isFlagged: (text: string) => Promise<boolean> };

export type SuitabilityCheck = { isSuitable: (text: string) => Promise<boolean> };

export type GenerateResult =
  | { kind: "audio"; bytes: Uint8Array }
  | { kind: "refused"; status: number; body: string }
  | { kind: "failed"; detail: string };

export type SoundGenerator = {
  generate: (options: { prompt: string; voice: VoiceSettings }) => Promise<GenerateResult>;
};

export type MeowStorage = {
  upload: (options: { path: string; bytes: Uint8Array }) => Promise<void>;
  getPublicUrl: (path: string) => string;
};

export type CreditBudget = {
  reserve: (options: { day: string; amount: number }) => Promise<boolean>;
  release: (options: { day: string; amount: number }) => Promise<void>;
};

export type MeowPipelineDependencies = {
  store: MeowStore;
  moderation: ModerationCheck;
  suitability: SuitabilityCheck;
  generator: SoundGenerator;
  storage: MeowStorage;
  budget: CreditBudget;
  clock: { now: () => Date };
  hashSecret: string;
  log: (message: string, details: unknown) => void;
};

export type MeowPipelineResult = MeowResponse | { kind: "catNotSaved" } | { kind: "invalid" };
