import type { LaundromatCopy } from "./i18n/laundromat-copy";
import type { SceneObject } from "./scene-config";

/** Return the hit target's `label` and `tooltip` for `object`, or `undefined` when the object is not interactive. */
export function describeSceneObject(options: {
  object: SceneObject;
  copy: LaundromatCopy;
}) {
  const { object, copy } = options;
  switch (object.kind) {
    case "washer":
    case "dryer": {
      const name = copy.machine.name(object);
      return {
        label: copy.machine.freeLabel({ name }),
        tooltip: copy.machine.freeTooltip({
          name: name.toLocaleLowerCase(copy.locale),
        }),
      };
    }
    case "tv":
      return { label: copy.tv.offLabel, tooltip: copy.tv.offTooltip };
    case "coffee-machine":
      return {
        label: copy.coffee.machineLabel,
        tooltip: copy.coffee.idleSwitchTooltip,
      };
    case "shelf":
      return {
        label: copy.shelf.loadingLabel,
        tooltip: copy.shelf.loadingTooltip,
      };
    case "notebook":
      return {
        label: copy.notebook.objectLabel,
        tooltip: copy.notebook.objectTooltip,
      };
    case "mat":
      return {
        label: copy.entranceMat.waitingLabel,
        tooltip: copy.entranceMat.waitingTooltip,
      };
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
