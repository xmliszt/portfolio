import type { CatLook } from "@/lib/paws/cat-look";

import { CAT_LOOK_CODE_FIELDS } from "./cat-look-code-fields";

/** Return `look` as a short code for a link: one base-36 character per field of `CAT_LOOK_CODE_FIELDS`, the index of the field's option. */
export function encodeCatLook(look: CatLook) {
  return CAT_LOOK_CODE_FIELDS.map(({ field, options }) =>
    Math.max(
      0,
      options.findIndex((option: string) => option === look[field])
    ).toString(36)
  ).join("");
}
