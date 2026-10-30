import "server-only";

import type { CreditBudget } from "./meow-pipeline-types";
import type { PawsServiceClient } from "./paws-service-client";

/** Return a daily credit budget that reserves and releases ElevenLabs credits atomically against `dailyCredits`. */
export function createCreditBudget(options: { client: PawsServiceClient; dailyCredits: number }): CreditBudget {
  return {
    reserve: async (reservation) => {
      const { data, error } = await options.client.rpc("reserve_credits", {
        p_day: reservation.day,
        p_amount: reservation.amount,
        p_cap: options.dailyCredits,
      });
      if (error) throw error;
      return data === true;
    },
    release: async (release) => {
      const { error } = await options.client.rpc("release_credits", { p_day: release.day, p_amount: release.amount });
      if (error) throw error;
    },
  };
}
