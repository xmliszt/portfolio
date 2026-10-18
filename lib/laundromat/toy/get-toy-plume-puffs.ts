import type { IsoPoint } from "@/lib/laundromat/scene-config";

import { getToyFlightFrame } from "./get-toy-flight-frame";
import { TOY_SET } from "./toy-set-geometry";

const LIFE_MS = 650;
const TRAVEL = 0.55;
const START_RADIUS = 0.025;
const END_RADIUS = 0.13;
const SPREAD = 0.05;
const FLOOR_SPREAD = 0.35;
const DOWN_OVERSHOOT = 0.1;

function hash(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/** Return the gas puffs alive `elapsedMs` into a run, one emitted per firing thruster every `spacingMs`: each with its centre in scene iso units, radius and opacity from 0 to 1, back to front. */
export function getToyPlumePuffs(options: {
  elapsedMs: number;
  origin: IsoPoint;
  spacingMs: number;
}) {
  const { elapsedMs, spacingMs, origin } = options;
  const floorZ = origin.z + TOY_SET.base.height;
  const first = Math.max(0, Math.ceil((elapsedMs - LIFE_MS) / spacingMs));
  const last = Math.floor(elapsedMs / spacingMs);
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, offset) => {
    const emission = first + offset;
    const emittedAtMs = emission * spacingMs;
    const age = (elapsedMs - emittedAtMs) / LIFE_MS;
    const frame = getToyFlightFrame({ elapsedMs: emittedAtMs, origin });
    return frame.thrusters.flatMap((thruster, index) => {
      if (thruster.strength <= 0.02) return [];
      const seed = emission * 7 + index;
      const isDown = thruster.direction.z < -0.5;
      const travel = isDown
        ? thruster.point.z - floorZ + DOWN_OVERSHOOT
        : TRAVEL * thruster.strength;
      const reach = travel * (1 - (1 - age) ** 2);
      const radius =
        (START_RADIUS + (END_RADIUS - START_RADIUS) * age ** 0.6) *
        (0.6 + 0.4 * thruster.strength);
      const spread = isDown ? FLOOR_SPREAD : SPREAD;
      const drift = {
        x: (hash(seed) - 0.5) * spread * age,
        y: (hash(seed + 0.5) - 0.5) * spread * age,
        z: isDown ? 0 : (hash(seed + 0.25) - 0.5) * SPREAD * age,
      };
      const center = {
        x: thruster.point.x + thruster.direction.x * reach + drift.x,
        y: thruster.point.y + thruster.direction.y * reach + drift.y,
        z: Math.max(
          thruster.point.z + thruster.direction.z * reach + drift.z,
          floorZ + radius * 0.4
        ),
      };
      return [
        { center, radius, opacity: thruster.strength * (1 - age) ** 1.5 },
      ];
    });
  })
    .flat()
    .toSorted(
      (a, b) =>
        a.center.x +
        a.center.y +
        a.center.z -
        (b.center.x + b.center.y + b.center.z)
    );
}
