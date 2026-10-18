import type { SceneObject } from "./scene-config";

/** `true` if an object of `kind` is drawn with a flat front face that fills its box; `false` when its front is round, open or too small to light. */
export function hasFlatFront(kind: SceneObject["kind"]) {
  switch (kind) {
    case "washer":
    case "dryer":
    case "counter":
    case "air-purifier":
      return true;
    case "coffee-machine":
    case "tv":
    case "window":
    case "clock":
    case "tube-display":
    case "shelf":
    case "table":
    case "notebook":
    case "stool":
    case "plant":
    case "basket":
    case "mug":
    case "mat":
    case "board":
    case "weather-panel":
    case "toy-box":
    case "toy-set":
    case "instant-camera":
      return false;
    default: {
      const unknown: never = kind;
      return unknown;
    }
  }
}
