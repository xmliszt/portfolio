import type { CatLook } from "@/lib/paws/cat-look";

import { CAT_CARD } from "./cat-card";
import { encodeCatLook } from "./encode-cat-look";

/** Return the path of the link preview card that shows a cat with `look`. */
export function getCatCardPath(look: CatLook) {
  return `/cards/${CAT_CARD.version}/${encodeCatLook(look)}`;
}
