import type { SpendResult, TokenNotice } from "./tip-token";

/** Return what dropping a token does after the server answers `result`: the spend time to record on the token, whether the machine gets its golden charge, the notice to show when it does not, and whether to keep the token in hand and the attempt for a retry. */
export function getDropOutcome(result: SpendResult): {
  spentAt: string | undefined;
  charge: boolean;
  notice: TokenNotice | undefined;
  retry: boolean;
} {
  switch (result.kind) {
    case "spent":
      return {
        spentAt: result.spentAt,
        charge: true,
        notice: undefined,
        retry: false,
      };
    case "already-spent":
      return {
        spentAt: result.spentAt,
        charge: false,
        notice: { kind: "used", spentAt: result.spentAt },
        retry: false,
      };
    case "unknown":
      return {
        spentAt: undefined,
        charge: false,
        notice: { kind: "unknown" },
        retry: false,
      };
    case "unavailable":
      return {
        spentAt: undefined,
        charge: false,
        notice: { kind: "offline" },
        retry: true,
      };
    default: {
      const unhandled: never = result;
      return unhandled;
    }
  }
}
