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
    case "mug":
    case "plant":
    case "basket":
    case "tube-display":
    case "board":
    case "weather-panel":
    case "air-purifier":
    case "toy-box":
    case "toy-set":
    case "instant-camera":
    case "coin-machine":
    case "tip-jar":
    case "ghost":
    case "skeleton":
    case "pumpkin":
      return true;
    case "cobweb":
    case "counter":
    case "window":
    case "clock":
    case "table":
    case "stool":
      return false;
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
