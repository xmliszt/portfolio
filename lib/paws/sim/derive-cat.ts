import type { CatLook, TailShape } from "@/lib/paws/cat-look";
import type { CatActivity, CatSnapshot } from "@/lib/paws/wire-types";

import { blendPose } from "./blend-pose";
import type { Vec2, Vec4 } from "./cat-poses";
import { catToWorld } from "./cat-to-world";
import { type CatBuild, getCatBuild } from "./get-cat-build";
import { hashUnit } from "./hash-unit";
import { LEG_LAYOUT, type LegSide } from "./leg-layout";
import { lerp } from "./lerp";

export const TAIL_SEGMENTS = 6;

/** Extra turn in radians at each tail joint, base first, that gives each tail shape its curve. */
const TAIL_BENDS = {
  slim: [0, 0, 0, 0, 0, 0],
  plume: [0, 0, 0, 0, 0, 0],
  wave: [0.5, 0.35, 0, -0.35, -0.5, -0.35],
  hook: [0, 0, 0, 0.3, 0.9, 1.1],
} as const satisfies { [shape in TailShape]: readonly number[] };

export type DerivedLeg = {
  front: boolean;
  side: LegSide;
  x: number;
  y: number;
  /** Height of the paw above the glass, including the pose's resting lift. */
  h: number;
  /** `[x, y, h]` of the shoulder or hip in world units. */
  attach: [number, number, number];
  pawAngle: number;
  padVisibility: number;
  /** `[x, y, r, h]` of the hind hock in world units, when the pose shows the sole. */
  hock: Vec4 | undefined;
};

export type DerivedCat = {
  userId: string;
  look: CatLook;
  build: CatBuild;
  /** World units per cat-local unit. */
  k: number;
  phase: number;
  activity: CatActivity;
  x: number;
  y: number;
  heading: number;
  /** Spine points `[x, y, r, h]` in world units, tail end first. */
  spine: Vec4[];
  head: Vec4;
  headDir: number;
  headH: number;
  nose: { x: number; y: number };
  thighs: [Vec4, Vec4];
  legs: [DerivedLeg, DerivedLeg, DerivedLeg, DerivedLeg];
  /** Tail joints in world units, base first. */
  tail: Vec2[];
  tailHeights: { base: number; tip: number };
  tailTip: { x: number; y: number };
  sleepWeight: number;
  soleWeight: number;
};

/** Return everything drawn for the cat in `snapshot` with `look` at `time` seconds: body outline points, head, nose, legs and tail, in world units. */
export function deriveCat(options: {
  snapshot: CatSnapshot;
  look: CatLook;
  time: number;
}): DerivedCat {
  const { snapshot, look, time } = options;
  const build = getCatBuild(look);
  const k = build.scale;
  const frame = {
    x: snapshot.x,
    y: snapshot.y,
    heading: snapshot.heading,
    scale: k,
  };
  const userHash = hashUnit(snapshot.userId);
  const phase = userHash * 100;
  const weights = snapshot.pose;
  const pose = blendPose(weights);

  const breath =
    Math.sin(time * (weights.sleep > 0.5 ? 1.4 : 2.2) + phase) *
    (1 - weights.stand);
  const spineLocal = pose.spine.map(
    ([x, y, r, h]): Vec4 => [
      x,
      y + ((snapshot.bend * x * x) / 4000) * weights.stand,
      r * (1 + 0.03 * breath),
      h,
    ]
  );
  const neck = spineLocal[spineLocal.length - 1];
  const reach = pose.head[0] + 24 * snapshot.sniff - neck[0];
  const lift = pose.head[1] - neck[1];
  const yawCos = Math.cos(snapshot.yaw);
  const yawSin = Math.sin(snapshot.yaw);
  const headLocal: Vec2 = [
    neck[0] + reach * yawCos - lift * yawSin,
    neck[1] + reach * yawSin + lift * yawCos,
  ];
  const headH = lerp(pose.head[3], 3, snapshot.sniff);
  const toWorld4 = (point: Vec4): Vec4 => [
    ...catToWorld(frame, [point[0], point[1]]),
    point[2] * k,
    point[3],
  ];

  const head = toWorld4([headLocal[0], headLocal[1], pose.head[2], headH]);
  const headDir = snapshot.heading + pose.headDir + snapshot.yaw;

  const tailBase = catToWorld(frame, [pose.tail[0], pose.tail[1]]);
  const sway = 1 - Math.max(weights.sit, weights.sleep) * 0.6;
  const bendSide = userHash < 0.5 ? -1 : 1;
  const tail = Array.from({ length: TAIL_SEGMENTS }).reduce<{
    points: Vec2[];
    angle: number;
  }>(
    (chain, _, i) => {
      const angle =
        chain.angle +
        pose.tail[3] / TAIL_SEGMENTS +
        Math.sin(time * 1.7 - i * 0.8 + phase) * 0.13 * sway +
        (TAIL_BENDS[look.tailShape].at(i) ?? 0) * bendSide * weights.stand;
      const last = chain.points[chain.points.length - 1];
      return {
        points: [
          ...chain.points,
          [
            last[0] + Math.cos(angle) * 20 * k,
            last[1] + Math.sin(angle) * 20 * k,
          ],
        ],
        angle,
      };
    },
    { points: [tailBase], angle: snapshot.heading + pose.tail[2] }
  ).points;
  const tipPoint = tail[tail.length - 1];

  const deriveLeg = (index: 0 | 1 | 2 | 3): DerivedLeg => {
    const place = LEG_LAYOUT[index];
    const sideIndex = place.side < 0 ? 0 : 1;
    const legSnapshot = snapshot.legs[index];
    const attachLocal = (place.front ? pose.frontAttach : pose.hindAttach)[
      sideIndex
    ];
    const baseH = place.front ? pose.frontH : pose.hindH;
    const hockLocal = pose.hock[sideIndex];
    return {
      front: place.front,
      side: place.side,
      x: legSnapshot.x,
      y: legSnapshot.y,
      h: legSnapshot.h + baseH,
      attach: [
        ...catToWorld(frame, [attachLocal[0], attachLocal[1]]),
        attachLocal[2],
      ],
      pawAngle:
        snapshot.heading +
        (place.front ? pose.pawAng[0] : pose.pawAng[1]) * place.side +
        place.side * (place.front ? 0.1 : 0.05),
      padVisibility: pose.padVis[place.front ? 0 : 1],
      hock:
        !place.front && pose.soleW > 0.05
          ? toWorld4([hockLocal[0], hockLocal[1], 8.5, hockLocal[2]])
          : undefined,
    };
  };

  return {
    userId: snapshot.userId,
    look,
    build,
    k,
    phase,
    activity: snapshot.activity,
    x: snapshot.x,
    y: snapshot.y,
    heading: snapshot.heading,
    spine: spineLocal.map(toWorld4),
    head,
    headDir,
    headH,
    nose: {
      x: head[0] + Math.cos(headDir) * 30 * k,
      y: head[1] + Math.sin(headDir) * 30 * k,
    },
    thighs: [toWorld4(pose.thigh[0]), toWorld4(pose.thigh[1])],
    legs: [deriveLeg(0), deriveLeg(1), deriveLeg(2), deriveLeg(3)],
    tail,
    tailHeights: { base: pose.tail[4], tip: pose.tail[5] },
    tailTip: { x: tipPoint[0], y: tipPoint[1] },
    sleepWeight: weights.sleep,
    soleWeight: pose.soleW,
  };
}
