import type { SceneLayout, ScreenBounds } from "./build-scene-layout";
import { isInteractiveSceneObject } from "./is-interactive-scene-object";
import type { CameraFocus } from "./parse-camera-focus";
import type { IsoProjection } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { SceneConfig, SceneObject } from "./scene-config";

export type Camera = { x: number; y: number; scale: number };

export type Viewport = { width: number; height: number };

export const MIN_HIT_TARGET_PX = 24;

/** Return the room scale: the padded fit, raised until the smallest hit target is `MIN_HIT_TARGET_PX`, capped where the room still fits the viewport. */
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
  const fullScale = Math.min(
    viewport.width / layout.size.width,
    viewport.height / layout.size.height
  );
  return Math.min(
    Math.max(fitScale, MIN_HIT_TARGET_PX / smallestTargetSide),
    fullScale
  );
}

/** Return the scene-pixel bounds of the front face (+y) of `object`. */
function getFrontFaceBounds(options: {
  object: SceneObject;
  projection: IsoProjection;
}) {
  const { position: p, size } = options.object;
  const corners = [
    { x: p.x, z: p.z },
    { x: p.x + size.w, z: p.z },
    { x: p.x, z: p.z + size.h },
    { x: p.x + size.w, z: p.z + size.h },
  ].map(({ x, z }) =>
    projectIsoPoint({
      point: { x, y: p.y + size.d, z },
      projection: options.projection,
    })
  );
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  } satisfies ScreenBounds;
}

/** Return the scale at which `frame` fills `viewport` with no padding. */
function getFullScale(options: { frame: ScreenBounds; viewport: Viewport }) {
  const { frame, viewport } = options;
  return Math.min(viewport.width / frame.width, viewport.height / frame.height);
}

/** Return the translate and scale that frame the room, or zoom onto the focused object leaving room around it, closer when the target sets `minUnitPx`. */
export function computeCamera(options: {
  focus: CameraFocus;
  viewport: Viewport;
  layout: SceneLayout;
  config: SceneConfig;
}) {
  const { focus, viewport, layout, config } = options;
  const roomScale = getRoomScale({ viewport, layout, config });
  const focusTarget =
    focus === "room" ? undefined : config.camera.focusTargets[focus];
  const target =
    focusTarget === undefined
      ? undefined
      : layout.objects.find(({ object }) => object.id === focusTarget.objectId);
  const fitted = (() => {
    if (target === undefined) {
      return {
        frame: { x: 0, y: 0, ...layout.size },
        scale: roomScale,
      };
    }
    const fill = 1 - 2 * config.camera.focusPaddingRatio;
    return {
      frame: target.bounds,
      scale: Math.min(
        Math.max(
          roomScale,
          getFullScale({ frame: target.bounds, viewport }) * fill
        ),
        roomScale * config.camera.maxFocusZoom
      ),
    };
  })();
  const { frame, scale } = (() => {
    if (target === undefined || focusTarget?.minUnitPx === undefined) {
      return fitted;
    }
    const front = getFrontFaceBounds({
      object: target.object,
      projection: layout.projection,
    });
    const legibleScale = Math.min(
      focusTarget.minUnitPx / layout.projection.unit,
      getFullScale({ frame: front, viewport })
    );
    return legibleScale > fitted.scale
      ? { frame: front, scale: legibleScale }
      : fitted;
  })();
  return {
    x: viewport.width / 2 - (frame.x + frame.width / 2) * scale,
    y: viewport.height / 2 - (frame.y + frame.height / 2) * scale,
    scale,
  } satisfies Camera;
}
