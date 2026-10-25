import type { SceneObject } from "./scene-config";
import { sortByDepth } from "./sort-by-depth";

export function sortSceneObjects(objects: SceneObject[]) {
  const pending = sortByDepth(objects);
  const ordered: SceneObject[] = [];
  while (pending.length > 0) {
    const nextIndex = pending.findIndex(
      (object) =>
        !("paintAfter" in object) ||
        !pending.some((other) => other.id === object.paintAfter)
    );
    const [next] = pending.splice(Math.max(0, nextIndex), 1);
    ordered.push(next);
  }
  return ordered;
}
