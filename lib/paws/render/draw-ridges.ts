import { createFingerprintTexture } from "./create-fingerprint-texture";
import type { SceneResources } from "./create-scene-resources";
import { createSurface } from "./create-surface";
import { FINGERTIP_SHAPE } from "./fingertip-shape";
import type { AnyContext } from "./render-types";

/** Draw the fingerprint at `x, y` out to `reach` (0–1 of the fingertip) from its centre, fading at that edge. */
export function drawRidges(options: {
  g: AnyContext;
  resources: SceneResources;
  x: number;
  y: number;
  reach: number;
  alpha: number;
}) {
  const { g, resources, reach, alpha } = options;
  if (alpha < 0.01 || reach < 0.03) return;
  const ridges =
    resources.ridges ??
    (() => {
      const fingerprint = createFingerprintTexture({
        createCanvas: resources.createCanvas,
      });
      const surface = createSurface({
        createCanvas: resources.createCanvas,
        width: fingerprint.width,
        height: fingerprint.height,
      });
      return { fingerprint, mask: surface };
    })();
  resources.ridges = ridges;
  const { canvas, g: mask } = ridges.mask;
  const { width, height } = canvas;
  mask.setTransform(1, 0, 0, 1, 0, 0);
  mask.globalCompositeOperation = "source-over";
  mask.clearRect(0, 0, width, height);
  mask.drawImage(ridges.fingerprint, 0, 0);
  mask.globalCompositeOperation = "destination-in";
  mask.setTransform(1, 0, 0, height / width, width / 2, height / 2);
  const radius = reach * (width / 2) * 1.05;
  const gradient = mask.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.78, "rgba(0,0,0,1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  mask.fillStyle = gradient;
  mask.fillRect(-width, -height, width * 2, height * 2);
  mask.globalCompositeOperation = "source-over";
  g.save();
  g.translate(options.x, options.y);
  g.rotate(FINGERTIP_SHAPE.angle);
  g.globalAlpha = alpha;
  g.drawImage(
    canvas,
    -FINGERTIP_SHAPE.rx,
    -FINGERTIP_SHAPE.ry,
    FINGERTIP_SHAPE.rx * 2,
    FINGERTIP_SHAPE.ry * 2
  );
  g.restore();
  g.globalAlpha = 1;
}
