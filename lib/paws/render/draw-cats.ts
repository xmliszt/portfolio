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

const BLEND_SAMPLES = 3;

type CatToDraw = { cat: DerivedCat; palette: CoatPalette };

function touches(options: { samples: Vec4[]; point: Vec4 }) {
  const [x, y, r] = options.point;
  return options.samples.some(
    (sample) => Math.hypot(sample[0] - x, sample[1] - y) < sample[2] + r
  );
}

function getCatParts(options: { draw: DrawContext } & CatToDraw) {
  const { draw, cat, palette } = options;
  const k = cat.k;
  const fluff = cat.build.fluff * 0.9 * k;
  const parts: Part[] = [];
  const capsule = (capsuleOptions: {
    a: Vec4;
    b: Vec4;
    color: string;
    alpha?: number;
    h?: number;
  }) => {
    const { a, b, color } = capsuleOptions;
    const h = capsuleOptions.h ?? (a[3] + b[3]) / 2;
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
          alpha: capsuleOptions.alpha,
        }),
    });
  };
  const disc = (point: Vec4, color: string, h?: number) =>
    capsule({ a: point, b: point, color, h });

  const head = cat.head;
  const body = sampleCurve({
    points: [...cat.spine, [head[0], head[1], head[2] * 0.55, cat.poseHeadH]],
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
  const runHeight = (run: { start: number; end: number }) =>
    body
      .slice(run.start, run.end + 1)
      .reduce((sum, point) => sum + point[3], 0) /
    (run.end - run.start + 1);
  const spans = runs.map((run, index) => {
    const neighbours = [runs[index - 1], run, runs[index + 1]].flatMap(
      (candidate) => (candidate === undefined ? [] : [runHeight(candidate)])
    );
    return {
      ...run,
      from: Math.max(0, run.start - BLEND_SAMPLES),
      to: Math.min(body.length - 1, run.end + BLEND_SAMPLES),
      h: Math.min(...neighbours) - 0.001,
    };
  });
  const fadeAlong = (
    span: (typeof spans)[number],
    to: number,
    color: string
  ) => {
    const fade = draw.g.createLinearGradient(
      body[span.from][0],
      body[span.from][1],
      body[to][0],
      body[to][1]
    );
    const extent = Math.max(1, to - span.from);
    const clear = `${color}00`;
    fade.addColorStop(0, span.from < span.start ? clear : color);
    fade.addColorStop(Math.min(1, (span.start - span.from) / extent), color);
    fade.addColorStop(
      Math.min(1, Math.max(0, 1 - (to - span.end) / extent)),
      color
    );
    fade.addColorStop(1, to > span.end ? clear : color);
    return fade;
  };
  if (runs.length > 1)
    for (const span of spans) {
      const samples = body.slice(span.from, span.to + 1);
      const h =
        samples.reduce((sum, point) => sum + point[3], 0) / samples.length;
      parts.push({
        h: span.h,
        draw: () =>
          softOutline({
            draw,
            samples,
            blur: blurOf(h, k) + fluff,
            color: fadeAlong(span, span.to, span.color),
          }),
      });
    }
  const tailSegments = cat.tail.length - 1;
  const { base, tip } = cat.tailHeights;
  const isPlume = cat.look.tailShape === "plume";
  const tailRadiusAt = (i: number) =>
    isPlume
      ? cat.build.tailRadius *
        (1 + 1.1 * Math.sin((Math.PI * i) / tailSegments))
      : cat.build.tailRadius - i * 0.4;
  const tail = sampleCurve({
    points: cat.tail.map(
      ([x, y], i): Vec4 => [
        x,
        y,
        tailRadiusAt(i) * k,
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
    .reduce<
      { start: number; end: number; color: string }[]
    >((list, point, i) => {
      const run = list.at(-1);
      const color = tailColorAt(i);
      if (
        run !== undefined &&
        run.color === color &&
        Math.abs(blurOf(point[3], k) - blurOf(tail[run.start][3], k)) < mergeGap
      ) {
        run.end = i + 1;
        return list;
      }
      return [...list, { start: Math.max(0, i - 1), end: i + 1, color }];
    }, []);
  const tailParts = tailRuns.map((run) => {
    const samples = tail.slice(run.start, run.end + 1);
    return {
      ...run,
      samples,
      h: samples.reduce((sum, point) => sum + point[3], 0) / samples.length,
    };
  });
  const bellySegments: { samples: Vec4[]; h: number; runH: number }[] = [];
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
    const blur =
      blurOf(
        patch.reduce((sum, point) => sum + point[3], 0) / patch.length,
        k
      ) +
      fluff +
      7 * k;
    for (const span of spans) {
      const to = Math.min(span.to, patch.length - 1);
      if (to <= span.from) continue;
      const samples = patch.slice(span.from, to + 1);
      const coveringRuns = spans.filter((other) =>
        body
          .slice(other.start, other.end + 1)
          .some((point) => touches({ samples, point }))
      );
      const h =
        Math.min(
          span.h,
          ...coveringRuns.map((other) => other.h),
          ...cat.thighs
            .filter((point) => touches({ samples, point }))
            .map((point) => point[3]),
        ) - 0.0005;
      bellySegments.push({ samples, h, runH: runHeight(span) });
      parts.push({
        h,
        draw: () =>
          softOutline({
            draw,
            samples,
            blur,
            color: fadeAlong(span, to, belly),
            alpha: 0.95,
          }),
      });
    }
  }

  const overBelly = (placeOptions: { points: Vec4[]; h: number }) => {
    const touched = bellySegments.filter((segment) =>
      placeOptions.points.some((point) =>
        touches({ samples: segment.samples, point })
      )
    );
    const cap = Math.min(...touched.map((segment) => segment.h));
    const ceiling = Math.max(...touched.map((segment) => segment.runH));
    const { h } = placeOptions;
    return h > cap && h < ceiling ? cap - 0.001 + h * 1e-6 : h;
  };

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
  const earH = head[3] + 2 + 5 * (1 - cat.sleepWeight);
  const earSize = cat.build.earScale;
  for (const side of [-1, 1]) {
    const ear = [
      onHead(-12, side * 18, 13, earH),
      onHead(-12 - 12.5 * earSize, side * (18 + 20 * earSize), 8.5, earH),
      onHead(-12 - 25 * earSize, side * (18 + 40 * earSize), 1.5, earH),
    ];
    parts.push({
      h: earH,
      draw: () =>
        softOutline({
          draw,
          samples: ear,
          blur: blurOf(earH, k) + fluff * 0.25,
          color: palette.ears,
        }),
    });
  }
  const faceStart = parts.length;
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
  const face = parts.splice(faceStart).toSorted((a, b) => b.h - a.h);
  const snout = face.slice(3);
  const skull = face.slice(0, 3);
  parts.push({
    h: head[3],
    draw: () => {
      for (const part of skull) part.draw();
    },
  });
  parts.push({
    h: Math.min(...snout.map((part) => part.h)),
    draw: () => {
      for (const part of snout) part.draw();
    },
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
    const top: Vec4 = [
      attachX,
      attachY,
      (leg.front ? 12 : 15) * k,
      attachH + 9,
    ];
    const place = (h: number) => overBelly({ points: [low, mid], h });
    capsule({
      a: low,
      b: mid,
      color: palette.lowerLeg,
      h: place((low[3] + mid[3]) / 2),
    });
    capsule({
      a: mid,
      b: top,
      color: palette.leg,
    });
    if (leg.hock !== undefined)
      capsule({
        a: leg.hock,
        b: [leg.x, leg.y, 9 * k, leg.h + 1],
        color: palette.sock,
        alpha: cat.soleWeight,
        h: place((leg.hock[3] + leg.h + 1) / 2),
      });
    disc(
      [
        leg.x + Math.cos(leg.pawAngle) * 2.5 * k,
        leg.y + Math.sin(leg.pawAngle) * 2.5 * k,
        12.5 * k,
        leg.h + 1.5,
      ],
      palette.sock,
      place(leg.h + 1.5)
    );
    if (leg.padVisibility > 0.02) {
      parts.push({
        h: place(leg.h - 0.5),
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

  for (const { samples, h, color } of tailParts) {
    parts.push({
      h: overBelly({ points: samples, h }),
      draw: () =>
        softOutline({
          draw,
          samples,
          blur: blurOf(h, k) + fluff + (isPlume ? 7 * k : 0),
          color,
        }),
    });
  }

  if (cat.headH < WHISKER_FADE_HEIGHT)
    parts.push({ h: 0, draw: () => drawWhiskers({ draw, cat }) });
  return parts;
}

/** Draw each of `cats` from below the glass in its `palette`, the parts of all of them ordered farthest from the glass first so nearer parts sit on top, whichever cat they belong to. */
export function drawCats(options: { draw: DrawContext; cats: CatToDraw[] }) {
  const parts = options.cats.flatMap((entry) =>
    getCatParts({ draw: options.draw, ...entry }).map((part) => ({
      ...part,
      userId: entry.cat.userId,
    }))
  );
  const nearestLast = parts.toSorted(
    (a, b) => b.h - a.h || a.userId.localeCompare(b.userId)
  );
  for (const part of nearestLast) part.draw();
}
