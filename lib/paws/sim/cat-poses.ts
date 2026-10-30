/** `[x, y]` in cat-local units: the cat faces +x and side index 0 is y < 0. */
export type Vec2 = [number, number];
/** `[x, y, h]`: a point and its height above the glass. */
export type Vec3 = [number, number, number];
/** `[x, y, r, h]`: a point, the radius of the body there, and its height above the glass. */
export type Vec4 = [number, number, number, number];

export type Pose = {
  spine: Vec4[];
  head: Vec4;
  headDir: number;
  front: [Vec2, Vec2];
  hind: [Vec2, Vec2];
  frontH: number;
  hindH: number;
  frontAttach: [Vec3, Vec3];
  hindAttach: [Vec3, Vec3];
  hock: [Vec3, Vec3];
  soleW: number;
  thigh: [Vec4, Vec4];
  pawAng: Vec2;
  padVis: Vec2;
  /** `[x, y, start angle, total curl, base height, tip height]`. */
  tail: [number, number, number, number, number, number];
};

export type PoseName = "stand" | "sit" | "sleep";

export type PoseWeights = { [name in PoseName]: number };

/** The three body shapes a cat blends between, in cat-local units seen from below the glass. */
export const CAT_POSES = {
  stand: {
    spine: [
      [-84, 0, 30, 34],
      [-52, 0, 40, 36],
      [-14, 0, 43, 37],
      [24, 0, 41, 38],
      [56, 0, 33, 42],
    ],
    head: [98, 0, 33, 46],
    headDir: 0,
    front: [
      [50, -24],
      [50, 24],
    ],
    hind: [
      [-62, -26],
      [-62, 26],
    ],
    frontH: 0,
    hindH: 0,
    frontAttach: [
      [46, -17, 32],
      [46, 17, 32],
    ],
    hindAttach: [
      [-60, -19, 30],
      [-60, 19, 30],
    ],
    hock: [
      [-62, -26, 14],
      [-62, 26, 14],
    ],
    soleW: 0,
    thigh: [
      [-58, -20, 22, 28],
      [-58, 20, 22, 28],
    ],
    pawAng: [0, 0],
    padVis: [1, 1],
    tail: [-92, 0, Math.PI, 0.3, 28, 60],
  },
  sit: {
    spine: [
      [-42, 0, 46, 1.5],
      [-28, 0, 42, 5],
      [-12, 0, 36, 16],
      [4, 0, 30, 32],
      [16, 0, 26, 50],
    ],
    head: [34, 0, 32, 72],
    headDir: 0,
    front: [
      [29, -11],
      [29, 11],
    ],
    hind: [
      [3, -15],
      [3, 15],
    ],
    frontH: 0,
    hindH: 0,
    frontAttach: [
      [24, -12, 40],
      [24, 12, 40],
    ],
    hindAttach: [
      [-30, -22, 4],
      [-30, 22, 4],
    ],
    hock: [
      [-38, -17, 0.5],
      [-38, 17, 0.5],
    ],
    soleW: 1,
    thigh: [
      [-30, -28, 28, 3],
      [-30, 28, 28, 3],
    ],
    pawAng: [0, 0],
    padVis: [1, 1],
    tail: [-74, 14, 2.2, -2.5, 2, 2],
  },
  sleep: {
    spine: [
      [-16, 43, 36, 3],
      [-44, 12, 40, 2.5],
      [-35, -30, 40, 2.5],
      [4, -46, 38, 3],
      [40, -23, 32, 3],
    ],
    head: [34, 22, 31, 2],
    headDir: 1.9,
    front: [
      [20, 2],
      [30, -4],
    ],
    hind: [
      [72, 32],
      [80, 16],
    ],
    frontH: 3,
    hindH: 1,
    frontAttach: [
      [34, -18, 4],
      [38, -12, 4],
    ],
    hindAttach: [
      [-26, 32, 4],
      [-16, 38, 4],
    ],
    hock: [
      [50, 36, 1],
      [56, 22, 1],
    ],
    soleW: 1,
    thigh: [
      [-26, 30, 26, 3],
      [-14, 36, 24, 4],
    ],
    pawAng: [2.2, 0.2],
    padVis: [0.35, 0.8],
    tail: [-6, 62, 3.3, 2.9, 3, 3],
  },
} as const satisfies { [name in PoseName]: Pose };
