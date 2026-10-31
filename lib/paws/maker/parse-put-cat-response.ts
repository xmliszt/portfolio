import type { PutCatResponse } from "@/lib/paws/cat-api-types";

import { parseSavedCat } from "./parse-saved-cat";

/** Return the `PUT /api/paws/cat` response in `value`, or `undefined` when it is not one of the contract's kinds. */
export function parsePutCatResponse(
  value: unknown
): PutCatResponse | undefined {
  if (typeof value !== "object" || value === null || !("kind" in value))
    return undefined;
  switch (value.kind) {
    case "saved": {
      const cat = "cat" in value ? parseSavedCat(value.cat) : undefined;
      return cat && { kind: "saved", cat };
    }
    case "invalid":
    case "signInRequired":
      return { kind: value.kind };
    default:
      return undefined;
  }
}
