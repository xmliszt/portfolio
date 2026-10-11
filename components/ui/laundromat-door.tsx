"use client";

import { useEffect, useId, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

const WALL = { length: 64, height: 64, thickness: 4 };
const FLOOR_DEPTH = 42;
const OPENING = { from: 18, width: 24, height: 46 };
const OPEN_ANGLE_DEG = 25;
const CLOSED_ANGLE_DEG = 3;
const LAMP = { along: 54, up: 80, out: -28, radius: 2 };
const FALLOFF_STEPS = 8;
const SIGN = { along: 30, up: 52, fontSize: 6.4 };

type WallPoint = { along: number; up: number; out: number };
type ScreenPoint = { x: number; y: number };

function toScreen(point: WallPoint): ScreenPoint {
  return {
    x: (point.along + point.out) * COS_30,
    y: (point.out - point.along) * SIN_30 - point.up,
  };
}

function formatPoints(points: ScreenPoint[]) {
  return points
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(" ");
}

function toPoints(points: WallPoint[]) {
  return formatPoints(points.map(toScreen));
}

/** Return the convex hull of `points`, counter-clockwise, by Andrew's monotone chain. */
function getHull(points: ScreenPoint[]) {
  const sorted = points.toSorted((a, b) => a.x - b.x || a.y - b.y);
  function cross(o: ScreenPoint, a: ScreenPoint, b: ScreenPoint) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }
  function chain(input: ScreenPoint[]) {
    return input.reduce<ScreenPoint[]>((hull, point) => {
      const next = [...hull];
      while (
        next.length >= 2 &&
        cross(next[next.length - 2], next[next.length - 1], point) <= 0
      ) {
        next.pop();
      }
      return [...next, point];
    }, []);
  }
  const lower = chain(sorted);
  const upper = chain(sorted.toReversed());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** Return where the ray from the centre of `LAMP` through `point` meets the floor. */
function castToFloor(point: WallPoint): WallPoint {
  const t = LAMP.up / (LAMP.up - point.up);
  return {
    along: LAMP.along + t * (point.along - LAMP.along),
    up: 0,
    out: LAMP.out + t * (point.out - LAMP.out),
  };
}

const openingTo = OPENING.from + OPENING.width;
const inside = -WALL.thickness;

const wallFace = [
  { along: 0, up: 0, out: 0 },
  { along: OPENING.from, up: 0, out: 0 },
  { along: OPENING.from, up: OPENING.height, out: 0 },
  { along: openingTo, up: OPENING.height, out: 0 },
  { along: openingTo, up: 0, out: 0 },
  { along: WALL.length, up: 0, out: 0 },
  { along: WALL.length, up: WALL.height, out: 0 },
  { along: 0, up: WALL.height, out: 0 },
];

const wallTop = toPoints([
  { along: 0, up: WALL.height, out: 0 },
  { along: WALL.length, up: WALL.height, out: 0 },
  { along: WALL.length, up: WALL.height, out: inside },
  { along: 0, up: WALL.height, out: inside },
]);

const wallEnd = toPoints([
  { along: 0, up: 0, out: 0 },
  { along: 0, up: 0, out: inside },
  { along: 0, up: WALL.height, out: inside },
  { along: 0, up: WALL.height, out: 0 },
]);

const floor = toPoints([
  { along: 0, up: 0, out: 0 },
  { along: WALL.length, up: 0, out: 0 },
  { along: WALL.length, up: 0, out: FLOOR_DEPTH },
  { along: 0, up: 0, out: FLOOR_DEPTH },
]);

const floorWithSill = toPoints([
  { along: 0, up: 0, out: 0 },
  { along: OPENING.from, up: 0, out: 0 },
  { along: OPENING.from, up: 0, out: inside },
  { along: openingTo, up: 0, out: inside },
  { along: openingTo, up: 0, out: 0 },
  { along: WALL.length, up: 0, out: 0 },
  { along: WALL.length, up: 0, out: FLOOR_DEPTH },
  { along: 0, up: 0, out: FLOOR_DEPTH },
]);

const sill = toPoints([
  { along: OPENING.from, up: 0, out: inside },
  { along: openingTo, up: 0, out: inside },
  { along: openingTo, up: 0, out: 0 },
  { along: OPENING.from, up: 0, out: 0 },
]);

const doorway = toPoints([
  { along: OPENING.from, up: 0, out: inside },
  { along: openingTo, up: 0, out: inside },
  { along: openingTo, up: OPENING.height, out: inside },
  { along: OPENING.from, up: OPENING.height, out: inside },
]);

const rightReveal = toPoints([
  { along: openingTo, up: 0, out: inside },
  { along: openingTo, up: 0, out: 0 },
  { along: openingTo, up: OPENING.height, out: 0 },
  { along: openingTo, up: OPENING.height, out: inside },
]);

const lampScreen = toScreen(LAMP);
const signOrigin = toScreen({ along: SIGN.along, up: SIGN.up, out: 0.4 });
const signToWallTransform = `matrix(${COS_30} ${-SIN_30} 0 1 ${signOrigin.x} ${signOrigin.y})`;
const lampFoot = toScreen({ along: LAMP.along, up: 0, out: LAMP.out });
const threshold = toScreen({
  along: (OPENING.from + openingTo) / 2,
  up: 0,
  out: 0,
});

/** Return `[offset, opacity]` stops for the floor falloff around the lamp's foot, normalised to 1 at the threshold. */
function getFalloffStops(radius: number) {
  const thresholdDistance = Math.hypot(
    (OPENING.from + openingTo) / 2 - LAMP.along,
    LAMP.out
  );
  // cos θ / d² from height h is (1 + (ρ / h)²)^-1.5 at floor distance ρ.
  function irradiance(distance: number) {
    return (1 + (distance / LAMP.up) ** 2) ** -1.5;
  }
  const atThreshold = irradiance(thresholdDistance);
  return Array.from({ length: FALLOFF_STEPS + 1 }, (_, index) => {
    const offset = index / FALLOFF_STEPS;
    return [
      offset,
      Math.min(1, irradiance(offset * radius) / atThreshold),
    ] as const;
  });
}

const FALLOFF_RADIUS = 110;
const falloffStops = getFalloffStops(FALLOFF_RADIUS);
const floorCircleToScreen = `translate(${lampFoot.x} ${lampFoot.y}) scale(${Math.SQRT2 * COS_30} ${Math.SQRT2 * SIN_30})`;

/** Return the screen shapes of the door swung `angleDeg` into the room and of the lamp light through the gap past its free edge. */
function getDoorShapes(angleDeg: number) {
  const theta = (angleDeg * Math.PI) / 180;
  const hinge = { along: OPENING.from, out: inside };
  const free = {
    along: hinge.along + OPENING.width * Math.cos(theta),
    out: hinge.out - OPENING.width * Math.sin(theta),
  };
  const knob = toScreen({
    along: hinge.along + 0.86 * (free.along - hinge.along),
    up: 21,
    out: hinge.out + 0.86 * (free.out - hinge.out),
  });

  const shadowEdgeTowardDoorway = (inside - LAMP.out) / (free.out - LAMP.out);
  const gapFrom = Math.min(
    openingTo,
    Math.max(
      OPENING.from,
      LAMP.along + shadowEdgeTowardDoorway * (free.along - LAMP.along)
    )
  );
  const gapWidth = openingTo - gapFrom;
  const aperture = [
    { along: gapFrom, up: 0, out: inside },
    { along: openingTo, up: 0, out: inside },
    { along: openingTo, up: OPENING.height, out: inside },
    { along: gapFrom, up: OPENING.height, out: inside },
  ];
  const farRight = castToFloor(aperture[2]);
  const farLeft = castToFloor(aperture[3]);
  const patch = [aperture[0], aperture[1], farRight, farLeft];
  const beam = getHull([...aperture, farRight, farLeft].map(toScreen));
  const castScale = LAMP.up / (LAMP.up - OPENING.height) - 1;

  return {
    panel: toPoints([
      { ...hinge, up: 0 },
      { ...free, up: 0 },
      { ...free, up: OPENING.height },
      { ...hinge, up: OPENING.height },
    ]),
    knob,
    innerShadow: toPoints([
      { ...hinge, up: 0 },
      { ...free, up: 0 },
      { along: gapFrom, up: 0, out: inside },
    ]),
    gapWidth,
    patch: toPoints(patch),
    beam: formatPoints(beam),
    beamStart: toScreen({
      along: openingTo,
      up: OPENING.height,
      out: inside,
    }),
    beamEnd: toScreen(farLeft),
    penumbra: LAMP.radius * castScale,
  };
}

/** Draw a dark isometric wall with its door swung half open, lit from a lamp inside: warm light through the gap, a beam in the air and a patch on the floor that fades with distance and softens at its far edge. */
export function LaundromatDoor() {
  const reduceMotion = useReducedMotion();
  const [angleDeg, setAngleDeg] = useState(
    reduceMotion ? OPEN_ANGLE_DEG : CLOSED_ANGLE_DEG
  );
  const id = useId();
  const ids = {
    room: `${id}-room`,
    falloff: `${id}-falloff`,
    beam: `${id}-beam`,
    panel: `${id}-panel`,
    bounce: `${id}-bounce`,
    doorway: `${id}-doorway`,
    floor: `${id}-floor`,
    wall: `${id}-wall`,
    glow: `${id}-glow`,
    soft: `${id}-soft`,
    penumbra: `${id}-penumbra`,
    neon: `${id}-neon`,
  };

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(CLOSED_ANGLE_DEG, OPEN_ANGLE_DEG, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setAngleDeg,
    });
    return () => controls.stop();
  }, [reduceMotion]);

  const door = getDoorShapes(angleDeg);
  const flux = door.gapWidth / OPENING.width;

  return (
    <svg
      viewBox="-12 -110 112 146"
      className="size-40 overflow-visible"
      role="img"
      aria-label="A door left half open under a glowing Laundro Cafe sign, warm light glowing through"
    >
      <defs>
        <radialGradient
          id={ids.room}
          gradientUnits="userSpaceOnUse"
          cx={lampScreen.x}
          cy={lampScreen.y}
          r="90"
        >
          <stop offset="0" stopColor="#ffe2b0" />
          <stop offset="0.45" stopColor="#ffa64a" />
          <stop offset="1" stopColor="#9a4512" />
        </radialGradient>
        <radialGradient
          id={ids.falloff}
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r={FALLOFF_RADIUS}
          gradientTransform={floorCircleToScreen}
        >
          {falloffStops.map(([offset, opacity]) => (
            <stop
              key={offset}
              offset={offset}
              stopColor="#ffb867"
              stopOpacity={opacity}
            />
          ))}
        </radialGradient>
        <linearGradient
          id={ids.beam}
          gradientUnits="userSpaceOnUse"
          x1={door.beamStart.x}
          y1={door.beamStart.y}
          x2={door.beamEnd.x}
          y2={door.beamEnd.y}
        >
          <stop offset="0" stopColor="#ffc47a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffc47a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={ids.panel} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3a2617" />
          <stop offset="0.5" stopColor="#1f1d1c" />
          <stop offset="1" stopColor="#1a1b1c" />
        </linearGradient>
        <radialGradient
          id={ids.bounce}
          gradientUnits="userSpaceOnUse"
          cx={threshold.x}
          cy={threshold.y}
          r="30"
          gradientTransform={`translate(${threshold.x} ${threshold.y}) scale(1 0.8) translate(${-threshold.x} ${-threshold.y})`}
        >
          <stop offset="0" stopColor="#ff9a2e" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ff9a2e" stopOpacity="0" />
        </radialGradient>
        <clipPath id={ids.doorway}>
          <polygon points={doorway} />
        </clipPath>
        <clipPath id={ids.floor}>
          <polygon points={floorWithSill} />
        </clipPath>
        <clipPath id={ids.wall}>
          <polygon points={toPoints(wallFace)} />
        </clipPath>
        <filter id={ids.glow} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={ids.soft} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id={ids.neon} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={ids.penumbra} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={door.penumbra} />
        </filter>
      </defs>

      <polygon points={wallTop} fill="#232527" />
      <polygon points={wallEnd} fill="#121314" />
      <polygon
        points={floor}
        fill="#0c0d0e"
        stroke="#2b2e30"
        strokeWidth="0.6"
      />

      <polygon points={doorway} fill={`url(#${ids.room})`} />
      <g clipPath={`url(#${ids.doorway})`}>
        <polygon
          points={door.innerShadow}
          fill="#1c130c"
          filter={`url(#${ids.soft})`}
        />
        <polygon
          points={door.panel}
          fill={`url(#${ids.panel})`}
          stroke="#3d4144"
          strokeWidth="0.4"
        />
        <circle cx={door.knob.x} cy={door.knob.y} r="1.1" fill="#868b8f" />
      </g>
      <polygon points={rightReveal} fill="#101112" />
      <polygon points={sill} fill="#1a1b1c" />

      <g clipPath={`url(#${ids.floor})`} opacity={flux}>
        <polygon
          points={door.patch}
          fill={`url(#${ids.falloff})`}
          filter={`url(#${ids.penumbra})`}
          opacity="0.75"
        />
        <polygon
          points={door.patch}
          fill={`url(#${ids.falloff})`}
          filter={`url(#${ids.soft})`}
          opacity="0.5"
        />
      </g>

      <polygon
        points={toPoints(wallFace)}
        fill="#17181a"
        stroke="#3d4144"
        strokeWidth="0.6"
      />
      <polygon
        points={toPoints(wallFace)}
        fill={`url(#${ids.bounce})`}
        opacity={flux}
      />

      <motion.g
        transform={signToWallTransform}
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={
          reduceMotion ? undefined : { opacity: [0, 1, 0.15, 1, 0.5, 1] }
        }
        transition={{
          duration: 0.9,
          delay: 0.2,
          times: [0, 0.1, 0.25, 0.4, 0.6, 1],
        }}
        fontFamily="ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
        fontSize={SIGN.fontSize}
        fontWeight="500"
        textAnchor="middle"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={-19} cy={-2} r="0.45" fill="#3d4144" />
        <circle cx={19} cy={-2} r="0.45" fill="#3d4144" />
        <text
          stroke="#ff9a2e"
          strokeWidth="1.8"
          filter={`url(#${ids.neon})`}
          style={{ mixBlendMode: "screen" }}
        >
          Laundro Cafe
        </text>
        <text stroke="#ffb45e" strokeWidth="0.7">
          Laundro Cafe
        </text>
        <text stroke="#fff1dc" strokeWidth="0.25">
          Laundro Cafe
        </text>
      </motion.g>

      <polygon
        points={door.beam}
        fill={`url(#${ids.beam})`}
        filter={`url(#${ids.soft})`}
        opacity={flux}
        style={{ mixBlendMode: "screen" }}
      />

      <motion.g
        filter={`url(#${ids.glow})`}
        style={{ mixBlendMode: "screen" }}
        animate={reduceMotion ? undefined : { opacity: [0.5, 0.35, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        opacity={0.5}
      >
        <g opacity={flux}>
          <g clipPath={`url(#${ids.floor})`}>
            <polygon points={door.patch} fill="#ff9a2e" />
          </g>
          <polygon points={door.beam} fill="#ff9a2e" opacity="0.4" />
        </g>
      </motion.g>
    </svg>
  );
}
