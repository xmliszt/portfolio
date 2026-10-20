import type { ChargeCheck, GoldenSpend } from "@/lib/laundromat/tip/tip-token";

export type ChargeCheckResult =
  | { kind: "checking" }
  | { kind: "found"; spends: GoldenSpend[]; now: number }
  | { kind: "failed" };

/** Return a copy of `checks` with each of `attempts` set from `result`: `checking`, `spent` into its machine until `now` plus its `remainingMs` when `spends` has it and `not-spent` otherwise, or removed when the check `failed`; other attempts are left unchanged. */
export function settleChargeChecks(options: {
  checks: { [attempt: string]: ChargeCheck };
  attempts: string[];
  result: ChargeCheckResult;
}) {
  const { result } = options;
  const next = { ...options.checks };
  options.attempts.forEach((attempt) => {
    switch (result.kind) {
      case "checking":
        next[attempt] = { kind: "checking" };
        return;
      case "found": {
        const spend = result.spends.find((each) => each.attempt === attempt);
        next[attempt] =
          spend === undefined
            ? { kind: "not-spent" }
            : {
                kind: "spent",
                machineId: spend.machineId,
                endsAtMs: result.now + spend.remainingMs,
              };
        return;
      }
      case "failed":
        delete next[attempt];
        return;
      default: {
        const unhandled: never = result;
        return unhandled;
      }
    }
  });
  return next;
}
