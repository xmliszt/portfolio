import type { FingerMessage, FingerPoint } from "@/lib/paws/wire-types";

import { clampNumber } from "./clamp-number";
import { parseWireId } from "./parse-wire-id";
import { WIRE_LIMITS } from "./wire-limits";

function parseX(value: unknown) {
  return clampNumber({ value, min: WIRE_LIMITS.minX, max: WIRE_LIMITS.maxX });
}

function parseY(value: unknown) {
  return clampNumber({ value, min: WIRE_LIMITS.minY, max: WIRE_LIMITS.maxY });
}

function parseTime(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function parseTrail(options: { value: unknown; before: number }) {
  if (!Array.isArray(options.value)) return undefined;
  const points = options.value
    .slice(-WIRE_LIMITS.maxTrailPoints)
    .flatMap((point: unknown): FingerPoint[] => {
      if (!Array.isArray(point)) return [];
      const x = parseX(point[0]);
      const y = parseY(point[1]);
      const t = parseTime(point[2]);
      return x === undefined || y === undefined || t === undefined
        ? []
        : [[x, y, t]];
    });
  return points.reduce<FingerPoint[]>((kept, point) => {
    const last = kept.at(-1);
    return point[2] < options.before &&
      (last === undefined || point[2] > last[2])
      ? [...kept, point]
      : kept;
  }, []);
}

/** Return the fingertip another visitor broadcast with every position clamped to the world bounds in `WIRE_LIMITS`, keeping the last `WIRE_LIMITS.maxTrailPoints` trail points that are well formed and in time order before `t`, or `undefined` when the payload is not one. */
export function parseFingerMessage(value: unknown): FingerMessage | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const userId = "userId" in value ? parseWireId(value.userId) : undefined;
  const x = "x" in value ? parseX(value.x) : undefined;
  const y = "y" in value ? parseY(value.y) : undefined;
  const t = "t" in value ? parseTime(value.t) : undefined;
  const trail =
    "trail" in value && t !== undefined
      ? parseTrail({ value: value.trail, before: t })
      : undefined;
  if (
    userId === undefined ||
    x === undefined ||
    y === undefined ||
    t === undefined ||
    trail === undefined ||
    !("pressed" in value && typeof value.pressed === "boolean") ||
    !(
      "seq" in value &&
      typeof value.seq === "number" &&
      Number.isSafeInteger(value.seq) &&
      value.seq >= 0
    )
  ) {
    return undefined;
  }
  return { userId, x, y, t, trail, pressed: value.pressed, seq: value.seq };
}
