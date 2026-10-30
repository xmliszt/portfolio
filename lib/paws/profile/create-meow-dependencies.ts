import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { createCreditBudget } from "./create-credit-budget";
import { createMeowStorage } from "./create-meow-storage";
import { createMeowStore } from "./create-meow-store";
import { createModerationCheck } from "./create-moderation-check";
import { createSoundGenerator } from "./create-sound-generator";
import { createSuitabilityCheck } from "./create-suitability-check";
import { getBorrowedMeowUrl } from "./get-borrowed-meow-url";
import type { MeowPipelineDependencies } from "./meow-pipeline-types";
import type { PawsServiceClient } from "./paws-service-client";
import { readMeowProvidersConfig } from "./read-meow-providers-config";

/** Return the meow pipeline's dependencies for this server: real providers where `process.env` has their keys, fake ones otherwise. */
export function createMeowDependencies(
  client: PawsServiceClient
): MeowPipelineDependencies {
  const config = readMeowProvidersConfig(process.env);
  return {
    store: createMeowStore(client),
    moderation: createModerationCheck({ config: config.moderation, fetch }),
    suitability: createSuitabilityCheck({ config: config.suitability, fetch }),
    generator: createSoundGenerator({
      config: config.generator,
      fetch,
      readFallbackClip: async (voice) =>
        readFile(join(process.cwd(), "public", getBorrowedMeowUrl(voice))),
    }),
    storage: createMeowStorage(client),
    budget: createCreditBudget({ client, dailyCredits: config.dailyCredits }),
    clock: { now: () => new Date() },
    hashSecret: config.hashSecret,
    log: (message, details) => console.warn(message, details),
  };
}
