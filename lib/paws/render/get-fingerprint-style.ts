import { hashUnit } from "@/lib/paws/sim/hash-unit";

/** Riso ink pairs printed as a split fountain: each fingerprint fades from the first ink into the second. */
const SPLIT_FOUNTAINS = [
  ["#ff48b0", "#ffb511"],
  ["#0078bf", "#00a95c"],
  ["#ff6c2f", "#ff48b0"],
  ["#765ba7", "#0078bf"],
  ["#00838a", "#82d8d5"],
  ["#f15060", "#ffb511"],
  ["#3d5588", "#ff48b0"],
  ["#00a95c", "#ffe800"],
] as const;

export const FINGERPRINT_PATTERNS = 4;
const MAX_TILT = 0.45;

export type FingerprintStyle = {
  inks: readonly [string, string];
  pattern: number;
  tilt: number;
};

/** Return the split-fountain inks, ridge pattern and tilt of `userId`'s fingerprint, the same on every screen. */
export function getFingerprintStyle(userId: string): FingerprintStyle {
  return {
    inks: SPLIT_FOUNTAINS[
      Math.floor(hashUnit(`${userId}:ink`) * SPLIT_FOUNTAINS.length)
    ],
    pattern: Math.floor(hashUnit(`${userId}:ridges`) * FINGERPRINT_PATTERNS),
    tilt: (hashUnit(`${userId}:tilt`) * 2 - 1) * MAX_TILT,
  };
}
