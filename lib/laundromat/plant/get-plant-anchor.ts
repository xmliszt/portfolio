import type { SceneLayout } from "@/lib/laundromat/build-scene-layout";
import type { Viewport } from "@/lib/laundromat/compute-camera";
import { computeCamera } from "@/lib/laundromat/compute-camera";
import type { CameraFocus } from "@/lib/laundromat/parse-camera-focus";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

/** Return the screen position of the top centre of the plant's hit bounds under the camera for `focus`, or `undefined` when the layout has no plant. */
export function getPlantAnchor(options: {
  layout: SceneLayout;
  viewport: Viewport;
  focus: CameraFocus;
  config: SceneConfig;
}) {
  const plant = options.layout.objects.find(
    ({ object }) => object.kind === "plant"
  );
  if (plant === undefined) return undefined;
  const camera = computeCamera(options);
  return {
    x: (plant.bounds.x + plant.bounds.width / 2) * camera.scale + camera.x,
    y: plant.bounds.y * camera.scale + camera.y,
  };
}
