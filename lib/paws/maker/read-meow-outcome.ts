import type { PawsCopy } from "@/lib/paws/i18n/paws-copy";
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

/** Return what the voice step shows and allows next for a `/api/paws/meow` response, with messages from `copy`. */
export function readMeowOutcome(options: {
  response: MeowResponse;
  copy: PawsCopy;
}): MeowOutcome {
  const { response, copy } = options;
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
        message: copy.meowResult.borrowed,
        canTryAgain: false,
      };
    case "failed":
      return {
        kind: "ready",
        meowUrl: response.meowUrl,
        message: copy.meowResult.failed,
        canTryAgain: true,
      };
    case "tooManyAttempts":
      return {
        kind: "ready",
        meowUrl: undefined,
        message: copy.meowResult.tooManyAttempts,
        canTryAgain: false,
      };
    case "inProgress":
      return { kind: "tryAnother", message: copy.meowResult.inProgress };
    case "refusedByUs":
      return { kind: "tryAnother", message: copy.meowResult.refusedByUs };
    case "refusedByProvider":
      return { kind: "tryAnother", message: copy.meowResult.refusedByProvider };
    case "signInRequired":
      return { kind: "signInRequired" };
    default: {
      const unhandled: never = response;
      return unhandled;
    }
  }
}
