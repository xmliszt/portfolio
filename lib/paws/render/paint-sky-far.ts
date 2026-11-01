import type { Sky } from "@/lib/paws/sky/sky-types";

import type { Surface } from "./create-surface";
import { getShadePatches } from "./get-shade-patches";
import type { AnyContext } from "./render-types";

const FAR_SCALE = 1 / 26;
const SOFT_SCALE = 1 / 6;

const SHADE_INKS = {
  spring: "#5a8f6a",
  summer: "#2f6b4f",
  autumn: "#9a6a3a",
  winter: "#5d6688",
  wet: "#2f6b4f",
  dry: "#6f8a55",
} as const satisfies { [season in Sky["season"]]: string };

const SHADE_ALPHA = {
  spring: 0.1,
  summer: 0.14,
  autumn: 0.09,
  winter: 0.06,
  wet: 0.13,
  dry: 0.08,
} as const satisfies { [season in Sky["season"]]: number };

function fit(surface: Surface, width: number, height: number) {
  const w = Math.max(2, Math.round(width));
  const h = Math.max(2, Math.round(height));
  if (surface.canvas.width !== w || surface.canvas.height !== h) {
    surface.canvas.width = w;
    surface.canvas.height = h;
  }
  surface.g.setTransform(1, 0, 0, 1, 0, 0);
  surface.g.globalCompositeOperation = "source-over";
  surface.g.globalAlpha = 1;
  surface.g.clearRect(0, 0, w, h);
}

function paintShade(options: {
  g: AnyContext;
  sky: Sky;
  seed: number;
  time: number;
  width: number;
  height: number;
}) {
  const { g, sky, width, height } = options;
  const cloud = sky.weather === "clear" ? 0 : 1;
  g.fillStyle = SHADE_INKS[sky.season];
  for (const patch of getShadePatches({
    seed: options.seed,
    time: options.time,
    sky,
    width,
    height,
  })) {
    g.globalAlpha =
      SHADE_ALPHA[sky.season] * (1 - 0.5 * cloud) * patch.strength;
    g.beginPath();
    g.ellipse(
      patch.x,
      patch.y,
      patch.rx,
      patch.ry,
      patch.angle,
      0,
      Math.PI * 2
    );
    g.fill();
  }
  g.globalAlpha = 0.12 * cloud;
  g.fillStyle = "#5d6688";
  g.fillRect(0, 0, width, height);
  g.globalAlpha = 1;
}

/** Paint the shade of what is far above the room for `sky` onto `g`, a `width` by `height` CSS pixel paper at `dpr`: the season-tinted canopy shade from `getShadePatches`, dimmed under cloud, drawn tiny on `far` and scaled up by way of `soft` so only their light and colour remain. */
export function paintSkyFar(options: {
  g: AnyContext;
  far: Surface;
  soft: Surface;
  sky: Sky;
  seed: number;
  time: number;
  width: number;
  height: number;
  dpr: number;
}) {
  const { g, far, soft, sky, width, height, dpr } = options;
  fit(far, width * FAR_SCALE, height * FAR_SCALE);
  far.g.setTransform(FAR_SCALE, 0, 0, FAR_SCALE, 0, 0);
  paintShade({
    g: far.g,
    sky,
    seed: options.seed,
    time: options.time,
    width,
    height,
  });
  fit(soft, width * SOFT_SCALE, height * SOFT_SCALE);
  soft.g.imageSmoothingEnabled = true;
  soft.g.imageSmoothingQuality = "high";
  soft.g.drawImage(far.canvas, 0, 0, soft.canvas.width, soft.canvas.height);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(soft.canvas, 0, 0, width * dpr, height * dpr);
  g.restore();
}
