import type { FallingClover } from "@/lib/laundromat/plant/create-falling-clovers";
import { createFallingClovers } from "@/lib/laundromat/plant/create-falling-clovers";
import { getCloverPose } from "@/lib/laundromat/plant/get-clover-pose";
import { getCloverTransform } from "@/lib/laundromat/plant/get-clover-transform";

import type { CloverGreens } from "./draw-clover-sprite";
import { drawCloverSprite } from "./draw-clover-sprite";

const CLOVER_GREENS = [
  { leaf: "#3fa944", shadow: "#33923a", vein: "#7fd06f", edge: "#25742b" },
  { leaf: "#4cb84a", shadow: "#3c9f3f", vein: "#8edb7c", edge: "#2b7f2f" },
  { leaf: "#35983f", shadow: "#2b8134", vein: "#6fc265", edge: "#1f6526" },
] satisfies CloverGreens[];
const SPRITE_SIZES_PX = [16, 24, 32, 44, 56];
const PX_PER_CLOVER = 13000;
const FULL_FRAME_MS = 1000 / 60;
const LITE_FRAME_MS = 1000 / 30;
const FRAME_SLACK_MS = 2;

type PlacedClover = {
  clover: FallingClover;
  sprite: HTMLCanvasElement;
  scale: number;
};

type Burst = {
  id: number;
  startMs: number;
  durationS: number;
  gustA: number;
  gustB: number;
  clovers: PlacedClover[];
};

export type CloverShowerPainter = ReturnType<typeof createCloverShowerPainter>;

function pickSpriteSize(sizePx: number) {
  return SPRITE_SIZES_PX.reduce((best, candidate) =>
    Math.abs(candidate - sizePx) < Math.abs(best - sizePx) ? candidate : best
  );
}

/** Return a painter that draws every clover shower onto `canvas` from one frame loop: `addBurst` starts one, `onBurstDone` reports each that has left the screen, and `dispose` stops the loop. */
export function createCloverShowerPainter(options: {
  canvas: HTMLCanvasElement;
  lite: boolean;
  still: boolean;
  onBurstDone: (id: number) => void;
}) {
  const { canvas, lite, still } = options;
  const context = canvas.getContext("2d");
  const pixelRatio = Math.min(window.devicePixelRatio, lite ? 1 : 1.5);
  const minFrameMs = (lite ? LITE_FRAME_MS : FULL_FRAME_MS) - FRAME_SLACK_MS;
  const sprites = CLOVER_GREENS.map((greens) =>
    SPRITE_SIZES_PX.map((sizePx) =>
      drawCloverSprite({ sizePx: Math.round(sizePx * pixelRatio), greens })
    )
  );
  const bursts: Burst[] = [];
  const knownIds = new Set<number>();
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  let frame = 0;
  let lastDrawMs = Number.NEGATIVE_INFINITY;
  let pausedAtMs: number | undefined;

  function fitCanvas() {
    const backingWidth = Math.round(width * pixelRatio);
    const backingHeight = Math.round(height * pixelRatio);
    if (canvas.width === backingWidth && canvas.height === backingHeight) {
      return;
    }
    canvas.width = backingWidth;
    canvas.height = backingHeight;
  }

  function placeClover(clover: FallingClover): PlacedClover {
    const spriteSize = pickSpriteSize(clover.sizePx);
    const shade = sprites[clover.shade] ?? sprites[0];
    return {
      clover,
      sprite: shade[SPRITE_SIZES_PX.indexOf(spriteSize)] ?? shade[0],
      scale: clover.sizePx / spriteSize,
    };
  }

  function addBurst(id: number) {
    if (knownIds.has(id)) return;
    knownIds.add(id);
    if (context === null) {
      options.onBurstDone(id);
      return;
    }
    const areaCount = Math.round((width * height) / PX_PER_CLOVER);
    const count = lite
      ? Math.min(40, Math.max(20, Math.round(areaCount / 2)))
      : Math.min(130, Math.max(50, areaCount));
    const clovers = createFallingClovers({
      count: still ? Math.round(count / 3) : count,
      viewport: { width, height },
      shadeCount: sprites.length,
    });
    bursts.push({
      id,
      startMs: performance.now(),
      durationS: Math.max(
        ...clovers.map(({ delayS, fallS }) => delayS + fallS)
      ),
      gustA: Math.random() * Math.PI * 2,
      gustB: Math.random() * Math.PI * 2,
      clovers: clovers.map(placeClover),
    });
    if (frame === 0 && pausedAtMs === undefined) {
      frame = requestAnimationFrame(draw);
    }
  }

  function drawBurst(burst: Burst, timeS: number) {
    if (context === null) return;
    const gustPx =
      55 * Math.sin(0.5 * timeS + burst.gustA) +
      22 * Math.sin(1.7 * timeS + burst.gustB);
    burst.clovers.forEach(({ clover, sprite, scale }) => {
      const pose = getCloverPose({
        clover,
        timeS,
        viewportHeight: height,
        gustPx,
        still,
      });
      if (
        pose === undefined ||
        pose.x < -clover.sizePx ||
        pose.x > width + clover.sizePx
      ) {
        return;
      }
      context.setTransform(
        getCloverTransform({
          x: pose.x,
          y: pose.y,
          rotation: pose.rotation,
          flip: pose.flip,
          spriteScale: scale,
          pixelRatio,
        })
      );
      context.globalAlpha = pose.opacity;
      context.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    });
  }

  function draw(nowMs: number) {
    if (context === null) return;
    if (nowMs - lastDrawMs < minFrameMs) {
      frame = requestAnimationFrame(draw);
      return;
    }
    lastDrawMs = nowMs;
    fitCanvas();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    const finished = bursts.filter(
      (burst) => (nowMs - burst.startMs) / 1000 >= burst.durationS
    );
    bursts
      .filter((burst) => !finished.includes(burst))
      .forEach((burst) => drawBurst(burst, (nowMs - burst.startMs) / 1000));
    context.globalAlpha = 1;
    finished.forEach((burst) => {
      bursts.splice(bursts.indexOf(burst), 1);
      options.onBurstDone(burst.id);
    });
    frame = bursts.length > 0 ? requestAnimationFrame(draw) : 0;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      pausedAtMs = performance.now();
      return;
    }
    if (pausedAtMs === undefined) return;
    const pausedMs = performance.now() - pausedAtMs;
    pausedAtMs = undefined;
    bursts.forEach((burst) => {
      burst.startMs += pausedMs;
    });
    if (bursts.length > 0) frame = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(([entry]) => {
    if (entry === undefined) return;
    width = entry.contentRect.width;
    height = entry.contentRect.height;
  });
  observer.observe(canvas);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  fitCanvas();

  return {
    addBurst,
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    },
  };
}
