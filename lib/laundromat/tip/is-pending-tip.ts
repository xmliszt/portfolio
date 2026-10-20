import type { PendingTip } from "./tip-token";

/** `true` if `value` has a string `sessionId` and `code` and a numeric `cents`; `false` when any is missing or of another type. */
export function isPendingTip(value: unknown): value is PendingTip {
  return (
    typeof value === "object" &&
    value !== null &&
    "sessionId" in value &&
    typeof value.sessionId === "string" &&
    "code" in value &&
    typeof value.code === "string" &&
    "cents" in value &&
    typeof value.cents === "number"
  );
}
