import type { RoomEvent } from "@/lib/paws/wire-types";

import { clampNumber } from "./clamp-number";
import { parseWireId } from "./parse-wire-id";
import { WIRE_LIMITS } from "./wire-limits";

const SOUNDS = ["meow", "purr", "lick"] as const;
const MAX_ANGLE = 4 * Math.PI;
const LAST_LEG = 3;

type Sound = (typeof SOUNDS)[number];

function isSound(value: unknown): value is Sound {
  return SOUNDS.some((sound) => sound === value);
}

/** Return the room event another screen broadcast with positions clamped to the world bounds in `WIRE_LIMITS`, or `undefined` when the payload is not one of the known kinds. */
export function parseRoomEvent(value: unknown): RoomEvent | undefined {
  if (typeof value !== "object" || value === null || !("kind" in value))
    return undefined;
  const userId = "userId" in value ? parseWireId(value.userId) : undefined;
  if (userId === undefined) return undefined;
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
  const angle =
    "angle" in value
      ? clampNumber({ value: value.angle, min: -MAX_ANGLE, max: MAX_ANGLE })
      : undefined;
  switch (value.kind) {
    case "sound":
      return "sound" in value && isSound(value.sound)
        ? { kind: "sound", userId, sound: value.sound }
        : undefined;
    case "pawPrint": {
      const leg =
        "leg" in value && Number.isInteger(value.leg)
          ? clampNumber({ value: value.leg, min: 0, max: LAST_LEG })
          : undefined;
      if (
        x === undefined ||
        y === undefined ||
        angle === undefined ||
        leg === undefined
      )
        return undefined;
      return { kind: "pawPrint", userId, x, y, angle, leg };
    }
    case "nosePrint":
      if (x === undefined || y === undefined || angle === undefined)
        return undefined;
      return { kind: "nosePrint", userId, x, y, angle };
    case "fingerPrint": {
      const pressure =
        "pressure" in value
          ? clampNumber({ value: value.pressure, min: 0, max: 1 })
          : undefined;
      if (x === undefined || y === undefined || pressure === undefined)
        return undefined;
      return { kind: "fingerPrint", userId, x, y, pressure };
    }
    default:
      return undefined;
  }
}
