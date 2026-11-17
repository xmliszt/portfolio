import type { SoundName } from "@/lib/laundromat/audio/sound-names";
import type { SceneDecoration } from "@/lib/laundromat/scene-config";

/** Return the sound `object` plays when tapped, or `undefined` when it is only scenery. */
export function getDecorationSound(
  object: SceneDecoration
): SoundName | undefined {
  switch (object.kind) {
    case "skeleton":
      return "skeleton-shy";
    case "pumpkin":
      return "pumpkin-tap";
    case "ghost":
      return "ghost-boo";
    case "christmas-tree":
      return object.potted ? "bedroom-tree-chime" : "tree-lights";
    case "present":
      return "present-hop";
    case "stockings":
      return "stocking-jingle";
    case "snowflakes":
      return "snowflake-flutter";
    case "poinsettia":
      return "poinsettia-rustle";
    case "snowman":
      return "snowman-wobble";
    case "cobweb":
    case "garland":
    case "holly":
      return undefined;
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
