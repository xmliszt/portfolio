import type { StoredTipToken } from "./tip-token";

function isOptional(options: { value: unknown; type: "string" | "number" }) {
  return options.value === undefined || typeof options.value === options.type;
}

/** `true` if `value` has a numeric `number`, string `code` and `createdAt`, a string `spentAt` and numeric `uses` and `usesLeft` when it has them; `false` otherwise. */
export function isTipToken(value: unknown): value is StoredTipToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "number" in value &&
    typeof value.number === "number" &&
    "code" in value &&
    typeof value.code === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    isOptional({
      value: "spentAt" in value ? value.spentAt : undefined,
      type: "string",
    }) &&
    isOptional({
      value: "uses" in value ? value.uses : undefined,
      type: "number",
    }) &&
    isOptional({
      value: "usesLeft" in value ? value.usesLeft : undefined,
      type: "number",
    })
  );
}
