import type { Sky } from "@/lib/paws/sky/sky-types";

import type { Surface } from "./create-surface";
import type { AnyContext } from "./render-types";

const MASK_SCALE = 1 / 20;
const SHADE_INK = "#5d6688";

/** Paint the light falling on the room for `sky` onto `g`, a `width` by `height` CSS pixel paper at `dpr`: a soft shade everywhere except one soft patch of sun that slides and stretches with the sun, warmed by the sun's glow ink; `wash` and `mask` are scratch canvases. */
export function paintSunlight(options: {
  g: AnyContext;
  wash: Surface;
  mask: Surface;
  sky: Sky;
  width: number;
  height: number;
  dpr: number;
}) {
  const { g, wash, mask, sky, width, height, dpr } = options;
  if (sky.sunlight < 0.02) return;
  const maskWidth = Math.max(2, Math.round(width * MASK_SCALE));
  const maskHeight = Math.max(2, Math.round(height * MASK_SCALE));
  if (mask.canvas.width !== maskWidth || mask.canvas.height !== maskHeight) {
    mask.canvas.width = maskWidth;
    mask.canvas.height = maskHeight;
  }
  const m = mask.g;
  m.setTransform(1, 0, 0, 1, 0, 0);
  m.globalCompositeOperation = "source-over";
  m.clearRect(0, 0, maskWidth, maskHeight);
  m.setTransform(MASK_SCALE, 0, 0, MASK_SCALE, 0, 0);
  m.fillStyle = "#fff";
  const up = Math.min(1, Math.max(0, sky.sunElevation / 60));
  m.save();
  m.translate(width * (0.5 - 0.3 * sky.sunSide), height * 0.6);
  m.rotate(-sky.sunSide * (1 - up) * 0.5);
  m.beginPath();
  m.ellipse(
    0,
    0,
    height * (0.34 + 0.14 * (1 - up)),
    height * 0.3,
    0,
    0,
    Math.PI * 2
  );
  m.fill();
  m.restore();
  const deviceWidth = Math.round(width * dpr);
  const deviceHeight = Math.round(height * dpr);
  const w = wash.g;
  w.setTransform(1, 0, 0, 1, 0, 0);
  w.globalCompositeOperation = "source-over";
  w.globalAlpha = 1;
  w.clearRect(0, 0, deviceWidth, deviceHeight);
  w.fillStyle = SHADE_INK;
  w.globalAlpha = 0.08 * sky.sunlight;
  w.fillRect(0, 0, deviceWidth, deviceHeight);
  w.globalAlpha = 1;
  w.globalCompositeOperation = "destination-out";
  w.imageSmoothingEnabled = true;
  w.imageSmoothingQuality = "high";
  w.drawImage(mask.canvas, 0, 0, deviceWidth, deviceHeight);
  w.globalCompositeOperation = "source-over";
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "multiply";
  g.drawImage(wash.canvas, 0, 0);
  w.clearRect(0, 0, deviceWidth, deviceHeight);
  w.drawImage(mask.canvas, 0, 0, deviceWidth, deviceHeight);
  w.globalCompositeOperation = "source-in";
  w.fillStyle = sky.light.glow;
  w.fillRect(0, 0, deviceWidth, deviceHeight);
  w.globalCompositeOperation = "source-over";
  g.globalAlpha = 0.07 * sky.sunlight;
  g.drawImage(wash.canvas, 0, 0);
  g.restore();
}
