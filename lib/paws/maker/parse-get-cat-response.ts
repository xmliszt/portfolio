import type { GetCatResponse } from "@/lib/paws/cat-api-types";

import { parseSavedCat } from "./parse-saved-cat";

/** Return the `GET /api/paws/cat` response in `value`, or `undefined` when it is not one of the contract's kinds. */
export function parseGetCatResponse(
  value: unknown
): GetCatResponse | undefined {
  if (typeof value !== "object" || value === null || !("kind" in value))
    return undefined;
  switch (value.kind) {
    case "found": {
      const cat = "cat" in value ? parseSavedCat(value.cat) : undefined;
      return cat && { kind: "found", cat };
    }
    case "none":
    case "signInRequired":
      return { kind: value.kind };
    default:
      return undefined;
  }
}
