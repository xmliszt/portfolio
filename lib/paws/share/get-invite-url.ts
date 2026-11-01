import type { CatLook } from "@/lib/paws/cat-look";

import { encodeCatLook } from "./encode-cat-look";

/** Return `href` with its query replaced by the `room` to join and, when the visitor has a cat, its `cat` code for the link preview, keeping the origin and path. */
export function getInviteUrl(options: {
  href: string;
  roomId: string | undefined;
  look: CatLook | undefined;
}) {
  const url = new URL(options.href);
  url.search = "";
  url.hash = "";
  if (options.roomId !== undefined)
    url.searchParams.set("room", options.roomId);
  if (options.look !== undefined)
    url.searchParams.set("cat", encodeCatLook(options.look));
  return url.toString();
}
