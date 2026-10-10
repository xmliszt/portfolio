import type { SceneObject } from "./scene-config";

/** Return the hit target's `label` and `tooltip` for `object`, or `undefined` when the object is not interactive. */
export function describeSceneObject(object: SceneObject) {
  switch (object.kind) {
    case "washer":
      return {
        label: `Washer ${object.number}, free`,
        tooltip: `washer ${object.number} · free`,
      };
    case "dryer":
      return {
        label: `Dryer ${object.number}, free`,
        tooltip: `dryer ${object.number} · free`,
      };
    case "tv":
      return { label: "TV, off", tooltip: "tv · off" };
    case "coffee-machine":
      return { label: "Coffee machine", tooltip: "brew a coffee" };
    case "shelf":
      return {
        label: "Look at the shelf of filled notebooks",
        tooltip: "filled notebooks",
      };
    case "notebook":
      return { label: "Open the notebook", tooltip: "notes from strangers" };
    case "counter":
    case "window":
    case "clock":
    case "table":
    case "stool":
    case "plant":
    case "basket":
    case "mug":
      return undefined;
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
