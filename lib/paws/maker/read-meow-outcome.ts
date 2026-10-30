import { COPY } from "@/lib/paws/copy";
import type { MeowResponse } from "@/lib/paws/meow-api-types";

export type MeowOutcome =
  | {
      kind: "ready";
      meowUrl: string | undefined;
      message: string | undefined;
      canTryAgain: boolean;
    }
  | { kind: "tryAnother"; message: string }
  | { kind: "signInRequired" };

/** Return what the voice step shows and allows next for a `/api/paws/meow` response. */
export function readMeowOutcome(response: MeowResponse): MeowOutcome {
  switch (response.kind) {
    case "generated":
    case "reused":
    case "alreadyHasMeow":
      return {
        kind: "ready",
        meowUrl: response.meowUrl,
        message: undefined,
        canTryAgain: false,
      };
    case "borrowed":
      return {
        kind: "ready",
        meowUrl: response.meowUrl,
        message: COPY.meowResult.borrowed,
        canTryAgain: false,
      };
    case "failed":
      return {
        kind: "ready",
        meowUrl: response.meowUrl,
        message: COPY.meowResult.failed,
        canTryAgain: true,
      };
    case "tooManyAttempts":
      return {
        kind: "ready",
        meowUrl: undefined,
        message: COPY.meowResult.tooManyAttempts,
        canTryAgain: false,
      };
    case "refusedByUs":
      return { kind: "tryAnother", message: COPY.meowResult.refusedByUs };
    case "refusedByProvider":
      return { kind: "tryAnother", message: COPY.meowResult.refusedByProvider };
    case "signInRequired":
      return { kind: "signInRequired" };
    default: {
      const unhandled: never = response;
      return unhandled;
    }
  }
}
