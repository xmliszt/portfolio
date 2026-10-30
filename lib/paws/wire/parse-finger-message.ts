import type { FingerMessage } from "@/lib/paws/wire-types";

import { clampNumber } from "./clamp-number";
import { parseWireId } from "./parse-wire-id";
import { WIRE_LIMITS } from "./wire-limits";

/** Return the fingertip another player broadcast with its position clamped to the world bounds in `WIRE_LIMITS`, or `undefined` when the payload is not one. */
export function parseFingerMessage(value: unknown): FingerMessage | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const userId = "userId" in value ? parseWireId(value.userId) : undefined;
  const x =
    "x" in value
      ? clampNumber({
          value: value.x,
          min: WIRE_LIMITS.minX,
          max: WIRE_LIMITS.maxX,
        })
      : undefined;
  const y =
    "y" in value
      ? clampNumber({
          value: value.y,
          min: WIRE_LIMITS.minY,
          max: WIRE_LIMITS.maxY,
        })
      : undefined;
  if (
    userId === undefined ||
    x === undefined ||
    y === undefined ||
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
  return { userId, x, y, pressed: value.pressed, seq: value.seq };
}
