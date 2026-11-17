import type { SceneDecoration } from "@/lib/laundromat/scene-config";

/** Return the hamper-room paint layer of a decoration of `kind`: `wall`, `hanging` or `floor`. */
export function getDecorationLayer(kind: SceneDecoration["kind"]) {
  switch (kind) {
    case "cobweb":
    case "garland":
    case "holly":
      return "wall";
    case "ghost":
    case "skeleton":
    case "stockings":
    case "snowflakes":
      return "hanging";
    case "pumpkin":
    case "christmas-tree":
    case "present":
    case "poinsettia":
    case "snowman":
      return "floor";
    default: {
      const unhandled: never = kind;
      return unhandled;
    }
  }
}
