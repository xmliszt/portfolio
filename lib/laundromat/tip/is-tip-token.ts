import type { TipToken } from "./tip-token";

/** `true` if `value` has a numeric `number` and string `code` and `createdAt`; `false` when any is missing or of another type. */
export function isTipToken(value: unknown): value is TipToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "number" in value &&
    typeof value.number === "number" &&
    "code" in value &&
    typeof value.code === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string"
  );
}
