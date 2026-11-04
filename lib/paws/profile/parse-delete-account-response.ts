import type { DeleteAccountResponse } from "@/lib/paws/account-api-types";

/** Return the `DELETE /api/paws/account` response in `value`, or `undefined` when it is not one of the contract's kinds. */
export function parseDeleteAccountResponse(
  value: unknown
): DeleteAccountResponse | undefined {
  if (typeof value !== "object" || value === null || !("kind" in value))
    return undefined;
  switch (value.kind) {
    case "deleted":
    case "signInRequired":
    case "failed":
      return { kind: value.kind };
    default:
      return undefined;
  }
}
