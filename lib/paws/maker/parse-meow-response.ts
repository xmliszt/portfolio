import type { MeowResponse } from "@/lib/paws/meow-api-types";

/** Return the `/api/paws/meow` response in `value`, or `undefined` when it is not one of the contract's kinds. */
export function parseMeowResponse(value: unknown): MeowResponse | undefined {
  if (typeof value !== "object" || value === null || !("kind" in value))
    return undefined;
  const meowUrl =
    "meowUrl" in value && typeof value.meowUrl === "string"
      ? value.meowUrl
      : undefined;
  switch (value.kind) {
    case "generated":
    case "reused":
    case "borrowed":
    case "failed":
    case "alreadyHasMeow":
      return meowUrl === undefined ? undefined : { kind: value.kind, meowUrl };
    case "refusedByUs":
    case "refusedByProvider":
    case "tooManyAttempts":
    case "signInRequired":
      return { kind: value.kind };
    default:
      return undefined;
  }
}
