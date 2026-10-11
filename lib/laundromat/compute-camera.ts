import type { SceneLayout } from "./build-scene-layout";
import { isInteractiveSceneObject } from "./is-interactive-scene-object";
import type { CameraFocus } from "./parse-camera-focus";
import type { SceneConfig } from "./scene-config";

export type Camera = { x: number; y: number; scale: number };

export type Viewport = { width: number; height: number };

export const MIN_HIT_TARGET_PX = 24;

function getRoomScale(options: {
  viewport: Viewport;
  layout: SceneLayout;
  config: SceneConfig;
}) {
  const { viewport, layout, config } = options;
  const fill = 1 - 2 * config.camera.roomPaddingRatio;
  const fitScale = Math.min(
    (viewport.width * fill) / layout.size.width,
    (viewport.height * fill) / layout.size.height
  );
  const smallestTargetSide = Math.min(
    ...layout.objects
      .filter(({ object }) => isInteractiveSceneObject(object))
      .flatMap(({ bounds, controls }) => [
        bounds,
        ...controls.map((control) => control.bounds),
      ])
      .map((bounds) => Math.min(bounds.width, bounds.height))
  );
  return Math.max(fitScale, MIN_HIT_TARGET_PX / smallestTargetSide);
}

/** Return the translate and scale that frame the room, or zoom onto the focused object leaving room around it. */
export function computeCamera(options: {
  focus: CameraFocus;
  viewport: Viewport;
  layout: SceneLayout;
  config: SceneConfig;
}) {
  const { focus, viewport, layout, config } = options;
  const roomScale = getRoomScale({ viewport, layout, config });
  const target =
    focus === "room"
      ? undefined
      : layout.objects.find(
          ({ object }) =>
            object.id === config.camera.focusTargets[focus].objectId
        );
  const frame = target?.bounds ?? {
    x: 0,
    y: 0,
    ...layout.size,
  };
  const fill = 1 - 2 * config.camera.focusPaddingRatio;
  const scale =
    target === undefined
      ? roomScale
      : Math.min(
          Math.max(
            roomScale,
            Math.min(
              (viewport.width * fill) / frame.width,
              (viewport.height * fill) / frame.height
            )
          ),
          roomScale * config.camera.maxFocusZoom
        );
  return {
    x: viewport.width / 2 - (frame.x + frame.width / 2) * scale,
    y: viewport.height / 2 - (frame.y + frame.height / 2) * scale,
    scale,
  } satisfies Camera;
}
