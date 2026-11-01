import { parseCatLook } from "@/lib/paws/parse-cat-look";

import { CAT_LOOK_CODE_FIELDS } from "./cat-look-code-fields";

/** Return the look a code from `encodeCatLook` spells, or `undefined` when `code` is not one. */
export function decodeCatLook(code: string) {
  if (!/^[0-9a-z]+$/.test(code) || code.length !== CAT_LOOK_CODE_FIELDS.length)
    return undefined;
  const fields = CAT_LOOK_CODE_FIELDS.map(({ field, options }, index) => [
    field,
    options[Number.parseInt(code.charAt(index), 36)],
  ]);
  if (fields.some(([, option]) => option === undefined)) return undefined;
  return parseCatLook(Object.fromEntries(fields));
}
