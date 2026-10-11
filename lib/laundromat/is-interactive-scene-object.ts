import type { SceneObject } from "./scene-config";

/** `true` if the visitor can point at or press `object`; `false` when it is only scenery. */
export function isInteractiveSceneObject(object: SceneObject) {
  switch (object.kind) {
    case "washer":
    case "dryer":
    case "tv":
    case "coffee-machine":
    case "shelf":
    case "notebook":
    case "mat":
      return true;
    case "counter":
    case "window":
    case "clock":
    case "table":
    case "stool":
    case "plant":
    case "basket":
    case "mug":
      return false;
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
