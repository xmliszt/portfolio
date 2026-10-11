import type { Camera, Viewport } from "./compute-camera";
import type { SceneConfig } from "./scene-config";

/** Return how long a camera move from `from` to `to` takes: `nearDurationMs` for no change, `farDurationMs` for a full zoom or a viewport-wide pan, linear between. */
export function getCameraMoveDurationMs(options: {
  from: Camera;
  to: Camera;
  viewport: Viewport;
  config: SceneConfig;
}) {
  const { from, to, viewport, config } = options;
  const { nearDurationMs, farDurationMs, maxFocusZoom } = config.camera;
  const zoomDistance =
    Math.abs(Math.log(to.scale / from.scale)) / Math.log(maxFocusZoom);
  const center = { x: viewport.width / 2, y: viewport.height / 2 };
  const fromCenter = {
    x: (center.x - from.x) / from.scale,
    y: (center.y - from.y) / from.scale,
  };
  const toCenter = {
    x: (center.x - to.x) / to.scale,
    y: (center.y - to.y) / to.scale,
  };
  const panDistance =
    (Math.hypot(toCenter.x - fromCenter.x, toCenter.y - fromCenter.y) *
      Math.min(from.scale, to.scale)) /
    Math.hypot(viewport.width, viewport.height);
  const distance = Math.min(1, Math.max(zoomDistance, panDistance));
  return nearDurationMs + (farDurationMs - nearDurationMs) * distance;
}
