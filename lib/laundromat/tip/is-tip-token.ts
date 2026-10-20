import type { TipToken } from "./tip-token";

/** `true` if `value` has a numeric `number`, string `code` and `createdAt`, and a string `spentAt` when it has one; `false` otherwise. */
export function isTipToken(value: unknown): value is TipToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "number" in value &&
    typeof value.number === "number" &&
    "code" in value &&
    typeof value.code === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    (!("spentAt" in value) ||
      value.spentAt === undefined ||
      typeof value.spentAt === "string")
  );
}
