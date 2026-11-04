import type { PostRow } from "./data/cc-rows";
import type { PostType } from "./post-types";

/** Return the `kind` and `repost_as` a post of `type` is saved with. */
export function toPostKind(type: PostType) {
  switch (type) {
    case "post":
    case "reply":
      return { kind: type, repost_as: "post" } satisfies Pick<
        PostRow,
        "kind" | "repost_as"
      >;
    case "quote":
    case "repost":
      return { kind: "repost", repost_as: type } satisfies Pick<
        PostRow,
        "kind" | "repost_as"
      >;
    default: {
      const unhandled: never = type;
      return unhandled;
    }
  }
}
