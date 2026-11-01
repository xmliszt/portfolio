import type { Sky } from "@/lib/paws/sky/sky-types";

import type { Surface } from "./create-surface";

/** Paint the night laid over the whole room for `sky` onto `night`, a `width` by `height` CSS pixel layer at `dpr`: the dark ink with a lamp pool and a moon glow left lighter, the pool warmed. Return `true` when it painted, `false` by day when the layer is left clear. */
export function paintNight(options: {
  night: Surface;
  sky: Sky;
  width: number;
  height: number;
  dpr: number;
}) {
  const { night, sky, width, height, dpr } = options;
  const deviceWidth = Math.max(1, Math.round(width * dpr));
  const deviceHeight = Math.max(1, Math.round(height * dpr));
  if (
    night.canvas.width !== deviceWidth ||
    night.canvas.height !== deviceHeight
  ) {
    night.canvas.width = deviceWidth;
    night.canvas.height = deviceHeight;
  }
  const g = night.g;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  g.clearRect(0, 0, deviceWidth, deviceHeight);
  if (sky.light.darkAlpha < 0.01) return false;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = sky.light.dark;
  g.globalAlpha = sky.light.darkAlpha;
  g.fillRect(0, 0, width, height);
  g.globalAlpha = 1;
  const lampX = width * 0.74;
  const lampY = height * 0.64;
  const lampR = Math.max(width, height) * 0.36;
  const holes = [
    { x: lampX, y: lampY, r: lampR, strength: 0.88 * sky.lamp },
    {
      x: width * 0.22,
      y: height * 0.14,
      r: Math.max(width, height) * 0.16,
      strength: sky.weather === "clear" ? 0.5 * sky.lamp : 0.15 * sky.lamp,
    },
  ];
  g.globalCompositeOperation = "destination-out";
  for (const hole of holes) {
    const gradient = g.createRadialGradient(
      hole.x,
      hole.y,
      0,
      hole.x,
      hole.y,
      hole.r
    );
    gradient.addColorStop(0, `rgba(0,0,0,${hole.strength})`);
    gradient.addColorStop(0.45, `rgba(0,0,0,${hole.strength * 0.55})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gradient;
    g.fillRect(0, 0, width, height);
  }
  g.globalCompositeOperation = "source-over";
  const warm = g.createRadialGradient(
    lampX,
    lampY,
    0,
    lampX,
    lampY,
    lampR * 0.8
  );
  warm.addColorStop(0, `rgba(255,207,122,${0.5 * sky.lamp})`);
  warm.addColorStop(1, "rgba(255,207,122,0)");
  g.fillStyle = warm;
  g.fillRect(0, 0, width, height);
  return true;
}
