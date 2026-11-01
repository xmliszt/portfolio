import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { hashUnit } from "@/lib/paws/sim/hash-unit";

const BUNDLES = 18;
const STRANDS_PER_BUNDLE = 3;
const STRAND_GAP = 0.12;
const STEPS = 28;

/** Points on a ball of radius 1 seen from below, the near half of one wrap of thread. */
export type YarnStrand = [number, number][];

/** Return the wraps of thread on the near side of the yarn ball `toyId`, seen from below on a ball of radius 1: bundles of a few side-by-side strands wound round the ball at angles picked from `toyId`, the same on every screen. */
export function getYarnStrands(toyId: string): YarnStrand[] {
  const random = createSeededRandom({
    seed: Math.floor(hashUnit(toyId) * 1e9),
  });
  return Array.from({ length: BUNDLES }).flatMap(() => {
    const z = random() * 1.6 - 0.8;
    const turn = random() * Math.PI * 2;
    const flat = Math.sqrt(1 - z * z);
    const normal = [flat * Math.cos(turn), flat * Math.sin(turn), z];
    const across = Math.hypot(normal[0], normal[1]);
    const u = [-normal[1] / across, normal[0] / across, 0];
    const v = [
      normal[1] * u[2] - normal[2] * u[1],
      normal[2] * u[0] - normal[0] * u[2],
      normal[0] * u[1] - normal[1] * u[0],
    ];
    const middle = (random() - 0.5) * 0.5;
    return Array.from({ length: STRANDS_PER_BUNDLE }).flatMap(
      (_, strand): YarnStrand[] => {
        const offset =
          middle + (strand - (STRANDS_PER_BUNDLE - 1) / 2) * STRAND_GAP;
        const ring = Math.sqrt(Math.max(0, 1 - offset * offset));
        const loop = Array.from({ length: STEPS }, (_, i) => {
          const t = (i / STEPS) * Math.PI * 2;
          return [0, 1, 2].map(
            (axis) =>
              normal[axis] * offset +
              ring * (Math.cos(t) * u[axis] + Math.sin(t) * v[axis])
          );
        });
        const hidden = loop.findIndex((point) => point[2] > 0);
        const points =
          hidden === -1
            ? [...loop, loop[0]]
            : [...loop.slice(hidden), ...loop.slice(0, hidden)].filter(
                (point) => point[2] <= 0
              );
        return points.length < 2
          ? []
          : [points.map((point): [number, number] => [point[0], point[1]])];
      }
    );
  });
}
