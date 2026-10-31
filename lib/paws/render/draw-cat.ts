import type { Vec4 } from "@/lib/paws/sim/cat-poses";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { lerp } from "@/lib/paws/sim/lerp";
import { valueNoise } from "@/lib/paws/sim/value-noise";

import { blurOf } from "./blur-of";
import { drawMouth } from "./draw-mouth";
import { drawNose } from "./draw-nose";
import { drawPads } from "./draw-pads";
import { drawWhiskers, WHISKER_FADE_HEIGHT } from "./draw-whiskers";
import type { CoatPalette } from "./get-coat-palette";
import type { DrawContext } from "./render-types";
import { sampleCurve } from "./sample-curve";
import { softCapsule } from "./soft-capsule";
import { softOutline } from "./soft-outline";

type Part = { h: number; draw: () => void };

/** Draw `cat` from below the glass in `palette`, its parts ordered farthest from the glass first so nearer parts sit on top. */
export function drawCat(options: {
  draw: DrawContext;
  cat: DerivedCat;
  palette: CoatPalette;
}) {
  const { draw, cat, palette } = options;
  const k = cat.k;
  const fluff = cat.build.fluff * 0.9 * k;
  const parts: Part[] = [];
  const capsule = (a: Vec4, b: Vec4, color: string, alpha = 1) => {
    const h = (a[3] + b[3]) / 2;
    parts.push({
      h,
      draw: () =>
        softCapsule({
          draw,
          ax: a[0],
          ay: a[1],
          bx: b[0],
          by: b[1],
          r: (a[2] + b[2]) / 2,
          blur: blurOf(h, k) + fluff,
          color,
          alpha,
        }),
    });
  };
  const disc = (point: Vec4, color: string) => capsule(point, point, color);

  const head = cat.head;
  const body = sampleCurve({
    points: [...cat.spine, [head[0], head[1], head[2] * 0.55, head[3]]],
    perSegment: 4,
  });
  const colorAt = (i: number) => {
    const section = Math.min(5, Math.floor(i / 4));
    return section < 4 ? palette.spine[section] : palette.neck;
  };
  const mergeGap = 1.2 * k + 0.6 / draw.unitPx;
  const runs = body
    .slice(0, -1)
    .reduce<
      { start: number; end: number; color: string }[]
    >((list, point, i) => {
      const run = list.at(-1);
      const color = colorAt(i);
      if (
        run !== undefined &&
        run.color === color &&
        Math.abs(blurOf(point[3], k) - blurOf(body[run.start][3], k)) < mergeGap
      ) {
        run.end = i + 1;
        return list;
      }
      return [
        ...list,
        {
          start: Math.max(0, i - (run === undefined ? 0 : 1)),
          end: i + 1,
          color,
        },
      ];
    }, []);
  for (const run of runs) {
    const samples = body.slice(run.start, run.end + 1);
    const h =
      samples.reduce((sum, point) => sum + point[3], 0) / samples.length;
    parts.push({
      h,
      draw: () =>
        softOutline({
          draw,
          samples,
          blur: blurOf(h, k) + fluff,
          color: run.color,
        }),
    });
  }
  const belly = palette.belly;
  if (belly !== undefined) {
    const patch = body
      .slice(0, -4)
      .map(
        (point, i): Vec4 => [
          point[0],
          point[1],
          point[2] *
            (0.34 + 0.16 * valueNoise(i * 0.45, cat.phase)) *
            (1 - 0.8 * cat.sleepWeight),
          point[3],
        ]
      );
    const h = patch.reduce((sum, point) => sum + point[3], 0) / patch.length;
    const lowest =
      Math.min(...cat.spine.map((point) => point[3]), head[3]) - 0.01;
    parts.push({
      h: lowest,
      draw: () =>
        softOutline({
          draw,
          samples: patch,
          blur: blurOf(h, k) + fluff + 7 * k,
          color: belly,
          alpha: 0.95,
        }),
    });
  }

  const cos = Math.cos(cat.headDir);
  const sin = Math.sin(cat.headDir);
  const onHead = (
    forward: number,
    side: number,
    r: number,
    h: number
  ): Vec4 => [
    head[0] + (cos * forward - sin * side) * k,
    head[1] + (sin * forward + cos * side) * k,
    r * k,
    h,
  ];
  const nearHead = (lift: number) => Math.max(0, head[3] - lift);
  const earH = head[3] + 4 + 10 * (1 - cat.sleepWeight);
  const earSize = cat.build.earScale;
  for (const side of [-1, 1]) {
    const ear = [
      onHead(-10, side * 20, 11, earH),
      onHead(-10 - 9 * earSize, side * (20 + 12 * earSize), 6.5, earH),
      onHead(-10 - 16 * earSize, side * (20 + 23 * earSize), 1.5, earH),
    ];
    parts.push({
      h: earH,
      draw: () =>
        softOutline({
          draw,
          samples: ear,
          blur: blurOf(earH, k) + fluff * 0.4,
          color: palette.ears,
        }),
    });
  }
  disc(onHead(-4, 0, 30, head[3]), palette.head);
  disc(onHead(0, -17, 21, nearHead(1)), palette.cheeks[0]);
  disc(onHead(0, 17, 21, nearHead(1)), palette.cheeks[1]);
  for (const side of [-1, 1])
    disc(onHead(19, side * 6.5, 8.5, nearHead(2)), palette.muzzle);
  disc(onHead(11, 0, 9, nearHead(3)), palette.muzzle);
  const mouthH = nearHead(3.5);
  parts.push({
    h: mouthH,
    draw: () =>
      drawMouth({
        g: draw.g,
        at: onHead(26, 0, 0, mouthH),
        angle: cat.headDir,
        k,
        lineWidth: 0.9 / draw.unitPx,
        color: palette.nose,
        alpha: 0.7 / (1 + blurOf(mouthH, k) * 0.3),
      }),
  });
  const noseH = Math.max(0, cat.headH - 4);
  parts.push({
    h: noseH - 0.2,
    draw: () =>
      drawNose({
        g: draw.g,
        x: cat.nose.x,
        y: cat.nose.y,
        angle: cat.headDir,
        k,
        h: noseH,
        color: palette.nose,
        alpha: 1,
      }),
  });
  disc(cat.thighs[0], palette.thighs[0]);
  disc(cat.thighs[1], palette.thighs[1]);

  cat.legs.forEach((leg, legIndex) => {
    const [attachX, attachY, attachH] = leg.attach;
    const low: Vec4 = [leg.x, leg.y, 9.5 * k, leg.h + 3];
    const mid: Vec4 = [
      lerp(leg.x, attachX, 0.5),
      lerp(leg.y, attachY, 0.5),
      11 * k,
      lerp(leg.h + 3, attachH + 9, 0.5),
    ];
    capsule(low, mid, palette.lowerLeg);
    capsule(
      mid,
      [attachX, attachY, (leg.front ? 12 : 15) * k, attachH + 9],
      palette.leg
    );
    if (leg.hock !== undefined)
      capsule(
        leg.hock,
        [leg.x, leg.y, 9 * k, leg.h + 1],
        palette.sock,
        cat.soleWeight
      );
    disc(
      [
        leg.x + Math.cos(leg.pawAngle) * 2.5 * k,
        leg.y + Math.sin(leg.pawAngle) * 2.5 * k,
        12.5 * k,
        leg.h + 1.5,
      ],
      palette.sock
    );
    if (leg.padVisibility > 0.02) {
      parts.push({
        h: leg.h - 0.5,
        draw: () =>
          drawPads({
            draw,
            x: leg.x,
            y: leg.y,
            angle: leg.pawAngle,
            k,
            h: leg.h,
            color: palette.pads[legIndex],
            alpha: leg.padVisibility,
          }),
      });
    }
  });

  const tailSegments = cat.tail.length - 1;
  const { base, tip } = cat.tailHeights;
  const tail = sampleCurve({
    points: cat.tail.map(
      ([x, y], i): Vec4 => [
        x,
        y,
        (cat.build.tailRadius - i * 0.4) * k,
        lerp(base, tip, i / tailSegments),
      ]
    ),
    perSegment: 4,
  });
  const tailColorAt = (i: number) =>
    palette.tail[Math.min(tailSegments - 1, Math.floor(i / 4))] ??
    palette.tail[0];
  const tailRuns = tail
    .slice(0, -1)
    .reduce<{ start: number; end: number; color: string }[]>((list, _, i) => {
      const run = list.at(-1);
      const color = tailColorAt(i);
      if (run !== undefined && run.color === color) {
        run.end = i + 1;
        return list;
      }
      return [...list, { start: Math.max(0, i - 1), end: i + 1, color }];
    }, []);
  for (const run of tailRuns) {
    const samples = tail.slice(run.start, run.end + 1);
    const h =
      samples.reduce((sum, point) => sum + point[3], 0) / samples.length;
    parts.push({
      h,
      draw: () =>
        softOutline({
          draw,
          samples,
          blur: blurOf(h, k) + fluff,
          color: run.color,
        }),
    });
  }

  if (cat.headH < WHISKER_FADE_HEIGHT)
    parts.push({ h: 0, draw: () => drawWhiskers({ draw, cat }) });
  for (const part of parts.toSorted((a, b) => b.h - a.h)) part.draw();
}
