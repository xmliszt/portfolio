import type { SpendResult, TokenNotice } from "./tip-token";

type DropOutcome = {
  spentAt: string | undefined;
  usesLeft: number | undefined;
  charge: boolean;
  notice: TokenNotice | undefined;
  retry: boolean;
};

/** Return what dropping a token does after the server answers `result`: the spend time and uses left to record on the token, whether the machine gets its golden charge, the notice to show, and whether to keep the token in hand and the attempt for a retry. */
export function getDropOutcome(result: SpendResult): DropOutcome {
  switch (result.kind) {
    case "spent":
      return {
        spentAt: result.spentAt,
        usesLeft: result.usesLeft,
        charge: true,
        notice: { kind: "left", usesLeft: result.usesLeft },
        retry: false,
      };
    case "already-spent":
      return {
        spentAt: result.spentAt,
        usesLeft: 0,
        charge: false,
        notice: { kind: "used", spentAt: result.spentAt },
        retry: false,
      };
    case "unknown":
      return {
        spentAt: undefined,
        usesLeft: undefined,
        charge: false,
        notice: { kind: "unknown" },
        retry: false,
      };
    case "unavailable":
      return {
        spentAt: undefined,
        usesLeft: undefined,
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
