import type {
  SceneDecoration,
  SceneObject,
} from "@/lib/laundromat/scene-config";

const DECORATION_KINDS = {
  pumpkin: true,
  ghost: true,
  skeleton: true,
  cobweb: true,
  "christmas-tree": true,
  present: true,
  garland: true,
  stockings: true,
  snowflakes: true,
  poinsettia: true,
  snowman: true,
  holly: true,
} satisfies { [kind in SceneDecoration["kind"]]: true };

/** `true` if `object` is a theme decoration; `false` when it is furniture or a machine. */
export function isSceneDecoration(
  object: SceneObject
): object is SceneDecoration {
  return Object.hasOwn(DECORATION_KINDS, object.kind);
}
