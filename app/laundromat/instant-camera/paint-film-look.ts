import { applyFilmTone } from "@/lib/laundromat/instant-camera/apply-film-tone";

const GRAIN_SCALE = 1.6;
const GRAIN_ALPHA = 0.22;

/** Repaint `canvas` as an instant-film print: film tone, a soft vignette, a faint warm light leak in the top-right corner and fine grain drawn from `random`. */
export function paintFilmLook(options: {
  canvas: HTMLCanvasElement;
  random: () => number;
}) {
  const { canvas, random } = options;
  const { width, height } = canvas;
  const context = canvas.getContext("2d");
  if (context === null) return;
  const image = context.getImageData(0, 0, width, height);
  image.data.set(applyFilmTone(image.data));
  context.putImageData(image, 0, 0);

  const vignette = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.hypot(width, height) * 0.58
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.32)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  const leak = context.createLinearGradient(
    width,
    0,
    width * 0.55,
    height * 0.45
  );
  leak.addColorStop(0, "rgba(255, 150, 70, 0.16)");
  leak.addColorStop(1, "rgba(255, 150, 70, 0)");
  context.globalCompositeOperation = "screen";
  context.fillStyle = leak;
  context.fillRect(0, 0, width, height);

  const grain = document.createElement("canvas");
  grain.width = Math.ceil(width / GRAIN_SCALE);
  grain.height = Math.ceil(height / GRAIN_SCALE);
  const grainContext = grain.getContext("2d");
  if (grainContext !== null) {
    const noise = grainContext.createImageData(grain.width, grain.height);
    for (let i = 0; i < noise.data.length; i += 4) {
      const value = 128 + (random() + random() + random() - 1.5) * 90;
      noise.data[i] = value;
      noise.data[i + 1] = value;
      noise.data[i + 2] = value;
      noise.data[i + 3] = 255;
    }
    grainContext.putImageData(noise, 0, 0);
    context.globalCompositeOperation = "overlay";
    context.globalAlpha = GRAIN_ALPHA;
    context.drawImage(grain, 0, 0, width, height);
  }
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
}
