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

/** Skin tones from light to deep, each with the slightly darker tone it shows while pressed. */
const SKINS = [
  { base: "#f7cdb8", pressed: "#f2bea6" },
  { base: "#f3b9a3", pressed: "#f1ad96" },
  { base: "#e8a98a", pressed: "#e29b7b" },
  { base: "#d99877", pressed: "#d18a68" },
  { base: "#c58260", pressed: "#bb7553" },
  { base: "#a96a4b", pressed: "#9e5f41" },
  { base: "#8a5238", pressed: "#7f4930" },
  { base: "#6c3f2b", pressed: "#623724" },
] as const;

const BASE_ANGLE = -0.35;
const MAX_TURN = 0.6;
const MAX_TILT = 0.2;

export type RidgeKind = "loop" | "whorl" | "arch";

export type FingerprintRidges = {
  kind: RidgeKind;
  coreX: number;
  coreY: number;
  gap: number;
  slant: number;
  seed: number;
};

export type FingerprintStyle = {
  userId: string;
  inks: readonly [string, string];
  skin: { base: string; pressed: string };
  /** The fingertip's tilt in radians. */
  angle: number;
  /** How much larger or smaller than the usual fingertip this one is. */
  scale: number;
  /** The print's turn on the fingertip in radians, so it never sits quite square. */
  tilt: number;
  ridges: FingerprintRidges;
};

/** Pick a fingerprint family from `unit`, weighted toward loops as in real hands. */
function pickRidgeKind(unit: number): RidgeKind {
  if (unit < 0.45) return "loop";
  if (unit < 0.8) return "whorl";
  return "arch";
}

/** Return how `userId`'s fingertip looks and prints: its skin, angle, size, split-fountain inks and generated ridges, the same on every screen. */
export function getFingerprintStyle(userId: string): FingerprintStyle {
  const unit = (part: string) => hashUnit(`${userId}:${part}`);
  const signed = (part: string) => unit(part) * 2 - 1;
  return {
    userId,
    inks: SPLIT_FOUNTAINS[Math.floor(unit("ink") * SPLIT_FOUNTAINS.length)],
    skin: SKINS[Math.floor(unit("skin") * SKINS.length)],
    angle: BASE_ANGLE + signed("angle") * MAX_TURN,
    scale: 0.88 + unit("scale") * 0.24,
    tilt: signed("tilt") * MAX_TILT,
    ridges: {
      kind: pickRidgeKind(unit("ridges")),
      coreX: signed("coreX") * 3,
      coreY: signed("coreY") * 3 - 1,
      gap: 1.3 + unit("gap") * 0.35,
      slant: signed("slant") * 0.6,
      seed: Math.floor(unit("seed") * 1000),
    },
  };
}
