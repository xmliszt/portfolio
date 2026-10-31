import { createFingerprintTexture } from "./create-fingerprint-texture";
import type { SceneResources } from "./create-scene-resources";
import { createSurface } from "./create-surface";
import { FINGERTIP_SHAPE } from "./fingertip-shape";
import type { FingerprintStyle } from "./get-fingerprint-style";
import type { AnyContext } from "./render-types";

const MAX_CACHED_FINGERPRINTS = 48;

/** Draw the fingerprint in `style` at `x, y` out to `reach` (0–1 of the fingertip) from its centre, fading at that edge, its ridges inked as a split fountain in the style's `tipInks` when `isOnSkin` and its `printInks` otherwise. */
export function drawRidges(options: {
  g: AnyContext;
  resources: SceneResources;
  x: number;
  y: number;
  reach: number;
  alpha: number;
  style: FingerprintStyle;
  isOnSkin: boolean;
}) {
  const { g, resources, reach, alpha, style } = options;
  if (alpha < 0.01 || reach < 0.03) return;
  const ridges = resources.ridges ?? {
    fingerprints: {},
    mask: createSurface({
      createCanvas: resources.createCanvas,
      width: FINGERTIP_SHAPE.rx * 10,
      height: FINGERTIP_SHAPE.ry * 10,
    }),
  };
  resources.ridges = ridges;
  if (Object.keys(ridges.fingerprints).length > MAX_CACHED_FINGERPRINTS)
    ridges.fingerprints = {};
  const fingerprint =
    ridges.fingerprints[style.userId] ??
    createFingerprintTexture({
      createCanvas: resources.createCanvas,
      ridges: style.ridges,
    });
  ridges.fingerprints[style.userId] = fingerprint;
  if (
    ridges.mask.canvas.width !== fingerprint.width ||
    ridges.mask.canvas.height !== fingerprint.height
  ) {
    ridges.mask.canvas.width = fingerprint.width;
    ridges.mask.canvas.height = fingerprint.height;
  }
  const { canvas, g: mask } = ridges.mask;
  const { width, height } = canvas;
  mask.setTransform(1, 0, 0, 1, 0, 0);
  mask.globalCompositeOperation = "source-over";
  mask.clearRect(0, 0, width, height);
  mask.drawImage(fingerprint, 0, 0);
  mask.globalCompositeOperation = "destination-in";
  mask.setTransform(1, 0, 0, height / width, width / 2, height / 2);
  const radius = reach * (width / 2) * 1.05;
  const gradient = mask.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.78, "rgba(0,0,0,1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  mask.fillStyle = gradient;
  mask.fillRect(-width, -height, width * 2, height * 2);
  mask.setTransform(1, 0, 0, 1, 0, 0);
  mask.globalCompositeOperation = "source-in";
  const fountain = mask.createLinearGradient(0, 0, width * 0.4, height);
  const inks = options.isOnSkin ? style.tipInks : style.printInks;
  fountain.addColorStop(0.15, inks[0]);
  fountain.addColorStop(0.85, inks[1]);
  mask.fillStyle = fountain;
  mask.fillRect(0, 0, width, height);
  mask.globalCompositeOperation = "source-over";
  g.save();
  g.translate(options.x, options.y);
  g.rotate(style.angle + style.tilt);
  g.globalAlpha = alpha;
  const rx = FINGERTIP_SHAPE.rx * style.scale;
  const ry = FINGERTIP_SHAPE.ry * style.scale;
  g.drawImage(canvas, -rx, -ry, rx * 2, ry * 2);
  g.restore();
  g.globalAlpha = 1;
}
