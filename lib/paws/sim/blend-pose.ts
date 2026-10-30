import {
  CAT_POSES,
  type Pose,
  type PoseWeights,
  type Vec2,
  type Vec3,
  type Vec4,
} from "./cat-poses";

/** Return a new pose that mixes the stand, sit and sleep poses by `weights`, which should sum to 1. */
export function blendPose(weights: PoseWeights): Pose {
  const { stand, sit, sleep } = CAT_POSES;
  const mix = (a: number, b: number, c: number) =>
    a * weights.stand + b * weights.sit + c * weights.sleep;
  const mix2 = (
    a: readonly number[],
    b: readonly number[],
    c: readonly number[]
  ): Vec2 => [mix(a[0], b[0], c[0]), mix(a[1], b[1], c[1])];
  const mix3 = (
    a: readonly number[],
    b: readonly number[],
    c: readonly number[]
  ): Vec3 => [
    mix(a[0], b[0], c[0]),
    mix(a[1], b[1], c[1]),
    mix(a[2], b[2], c[2]),
  ];
  const mix4 = (
    a: readonly number[],
    b: readonly number[],
    c: readonly number[]
  ): Vec4 => [
    mix(a[0], b[0], c[0]),
    mix(a[1], b[1], c[1]),
    mix(a[2], b[2], c[2]),
    mix(a[3], b[3], c[3]),
  ];
  return {
    spine: stand.spine.map((point, i) =>
      mix4(point, sit.spine[i], sleep.spine[i])
    ),
    head: mix4(stand.head, sit.head, sleep.head),
    headDir: mix(stand.headDir, sit.headDir, sleep.headDir),
    front: [
      mix2(stand.front[0], sit.front[0], sleep.front[0]),
      mix2(stand.front[1], sit.front[1], sleep.front[1]),
    ],
    hind: [
      mix2(stand.hind[0], sit.hind[0], sleep.hind[0]),
      mix2(stand.hind[1], sit.hind[1], sleep.hind[1]),
    ],
    frontH: mix(stand.frontH, sit.frontH, sleep.frontH),
    hindH: mix(stand.hindH, sit.hindH, sleep.hindH),
    frontAttach: [
      mix3(stand.frontAttach[0], sit.frontAttach[0], sleep.frontAttach[0]),
      mix3(stand.frontAttach[1], sit.frontAttach[1], sleep.frontAttach[1]),
    ],
    hindAttach: [
      mix3(stand.hindAttach[0], sit.hindAttach[0], sleep.hindAttach[0]),
      mix3(stand.hindAttach[1], sit.hindAttach[1], sleep.hindAttach[1]),
    ],
    hock: [
      mix3(stand.hock[0], sit.hock[0], sleep.hock[0]),
      mix3(stand.hock[1], sit.hock[1], sleep.hock[1]),
    ],
    soleW: mix(stand.soleW, sit.soleW, sleep.soleW),
    thigh: [
      mix4(stand.thigh[0], sit.thigh[0], sleep.thigh[0]),
      mix4(stand.thigh[1], sit.thigh[1], sleep.thigh[1]),
    ],
    pawAng: mix2(stand.pawAng, sit.pawAng, sleep.pawAng),
    padVis: mix2(stand.padVis, sit.padVis, sleep.padVis),
    tail: [
      mix(stand.tail[0], sit.tail[0], sleep.tail[0]),
      mix(stand.tail[1], sit.tail[1], sleep.tail[1]),
      mix(stand.tail[2], sit.tail[2], sleep.tail[2]),
      mix(stand.tail[3], sit.tail[3], sleep.tail[3]),
      mix(stand.tail[4], sit.tail[4], sleep.tail[4]),
      mix(stand.tail[5], sit.tail[5], sleep.tail[5]),
    ],
  };
}
