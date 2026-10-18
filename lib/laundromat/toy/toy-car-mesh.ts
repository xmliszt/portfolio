import type { IsoPoint } from "@/lib/laundromat/scene-config";

export type ToyCarPart = "body" | "glass" | "tyre" | "hub" | "tail" | "head";

/** One flat face of the toy car in car space: `x` to the car's right, `y` forward, `z` up, with the origin at the middle of the body. */
export type ToyCarFace = {
  part: ToyCarPart;
  points: IsoPoint[];
  normal: IsoPoint;
  decal: boolean;
  wheelSide: 1 | -1 | undefined;
};

type Profile = { y: number; z: number }[];

const CENTER_Z = 0.065;
const WHEEL = { radius: 0.042, sides: 8, axleY: 0.17, fromX: 0.1, toX: 0.125 };

function subtract(a: IsoPoint, b: IsoPoint) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function average(points: IsoPoint[]) {
  const sum = points.reduce(
    (total, point) => ({
      x: total.x + point.x,
      y: total.y + point.y,
      z: total.z + point.z,
    }),
    { x: 0, y: 0, z: 0 }
  );
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
    z: sum.z / points.length,
  };
}

function outwardNormal(points: IsoPoint[], partCenter: IsoPoint) {
  const [a, b, c] = points;
  const u = subtract(b, a);
  const v = subtract(c, a);
  const n = {
    x: u.y * v.z - u.z * v.y,
    y: u.z * v.x - u.x * v.z,
    z: u.x * v.y - u.y * v.x,
  };
  const length = Math.hypot(n.x, n.y, n.z);
  const away = subtract(average(points), partCenter);
  const sign = n.x * away.x + n.y * away.y + n.z * away.z < 0 ? -1 : 1;
  return {
    x: (sign * n.x) / length,
    y: (sign * n.y) / length,
    z: (sign * n.z) / length,
  };
}

function extrude(options: {
  profile: Profile;
  fromX: number;
  toX: number;
  capPart: ToyCarPart;
  edgePart: (index: number) => ToyCarPart;
  caps: "both" | "outer";
}) {
  const { profile, fromX, toX } = options;
  function at(x: number, point: Profile[number]) {
    return { x, y: point.y, z: point.z - CENTER_Z };
  }
  const near = profile.map((point) => at(toX, point));
  const far = profile.map((point) => at(fromX, point));
  const center = average([...near, ...far]);
  const caps = options.caps === "both" ? [near, far] : [near];
  const edges = profile.map((point, index) => {
    const next = profile[(index + 1) % profile.length];
    return {
      part: options.edgePart(index),
      points: [
        at(fromX, point),
        at(toX, point),
        at(toX, next),
        at(fromX, next),
      ],
    };
  });
  return [
    ...caps.map((points) => ({ part: options.capPart, points })),
    ...edges,
  ].map((face) => ({
    ...face,
    normal: outwardNormal(face.points, center),
    decal: false,
    wheelSide: undefined,
  }));
}

function mirrorX(faces: ToyCarFace[]) {
  return faces.map((face) => ({
    ...face,
    points: face.points
      .map((point) => ({ ...point, x: -point.x }))
      .toReversed(),
    normal: { ...face.normal, x: -face.normal.x },
  }));
}

function onSide(options: { faces: ToyCarFace[]; side: 1 | -1 }) {
  return options.faces.map((face) => ({ ...face, wheelSide: options.side }));
}

const BODY: Profile = [
  { y: -0.28, z: 0.03 },
  { y: 0.27, z: 0.03 },
  { y: 0.28, z: 0.05 },
  { y: 0.24, z: 0.068 },
  { y: 0.04, z: 0.085 },
  { y: -0.2, z: 0.086 },
  { y: -0.28, z: 0.076 },
];

const CABIN: Profile = [
  { y: -0.14, z: 0.085 },
  { y: 0.1, z: 0.085 },
  { y: 0.0, z: 0.124 },
  { y: -0.09, z: 0.124 },
];
const CABIN_ROOF_EDGE = 2;

const WHEEL_PROFILE: Profile = Array.from(
  { length: WHEEL.sides },
  (_, index) => {
    const angle = (index / WHEEL.sides) * Math.PI * 2 + Math.PI / WHEEL.sides;
    return {
      y: WHEEL.radius * Math.cos(angle),
      z: WHEEL.radius + WHEEL.radius * Math.sin(angle),
    };
  }
);

function decal(options: {
  part: ToyCarPart;
  points: IsoPoint[];
  normal: IsoPoint;
}): ToyCarFace {
  return { ...options, decal: true, wheelSide: undefined };
}

const body = extrude({
  profile: BODY,
  fromX: -0.12,
  toX: 0.12,
  capPart: "body",
  edgePart: () => "body",
  caps: "both",
});

const cabin = extrude({
  profile: CABIN,
  fromX: -0.085,
  toX: 0.085,
  capPart: "glass",
  edgePart: (index) => (index === CABIN_ROOF_EDGE ? "body" : "glass"),
  caps: "both",
});

const wheels = [WHEEL.axleY, -WHEEL.axleY].flatMap((axleY) => {
  const right = extrude({
    profile: WHEEL_PROFILE.map((point) => ({ ...point, y: point.y + axleY })),
    fromX: WHEEL.fromX,
    toX: WHEEL.toX,
    capPart: "hub",
    edgePart: () => "tyre",
    caps: "outer",
  });
  return [
    ...onSide({ faces: right, side: 1 }),
    ...onSide({ faces: mirrorX(right), side: -1 }),
  ];
});

const tailY = -0.2805;
const tailLight = decal({
  part: "tail",
  normal: { x: 0, y: -1, z: 0 },
  points: [
    { x: 0.1, y: tailY, z: 0.06 - CENTER_Z },
    { x: -0.1, y: tailY, z: 0.06 - CENTER_Z },
    { x: -0.1, y: tailY, z: 0.068 - CENTER_Z },
    { x: 0.1, y: tailY, z: 0.068 - CENTER_Z },
  ],
});

const noseSlope = outwardNormal(
  [
    { x: 0, y: 0.28, z: 0.05 },
    { x: 1, y: 0.28, z: 0.05 },
    { x: 0, y: 0.24, z: 0.068 },
  ],
  { x: 0, y: 0, z: 0 }
);
const headLights = [1, -1].map((side) =>
  decal({
    part: "head",
    normal: noseSlope,
    points: [
      { x: side * 0.105, y: 0.272, z: 0.055 - CENTER_Z + 0.0005 },
      { x: side * 0.06, y: 0.272, z: 0.055 - CENTER_Z + 0.0005 },
      { x: side * 0.06, y: 0.262, z: 0.06 - CENTER_Z + 0.0005 },
      { x: side * 0.105, y: 0.262, z: 0.06 - CENTER_Z + 0.0005 },
    ],
  })
);

/** The toy roadster's faces: a low wedge body, a glass cabin, four eight-sided wheels, a red tail light strip and two headlights. */
export const TOY_CAR_MESH: ToyCarFace[] = [
  ...body,
  ...cabin,
  ...wheels,
  tailLight,
  ...headLights,
];

/** Height of the car's middle above the ground it stands on. */
export const TOY_CAR_CENTER_Z = CENTER_Z;
