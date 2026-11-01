import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { TOY_ITEMS } from "@/lib/paws/sim/toy-items";
import type {
  CatActivity,
  CatsMessage,
  CatSnapshot,
  LegSnapshot,
  PawPrintEvent,
  ToySnapshot,
  ToySpill,
  ToyTrail,
} from "@/lib/paws/wire-types";

import { clampNumber } from "./clamp-number";
import { parseRoomEvent } from "./parse-room-event";
import { parseWireId } from "./parse-wire-id";
import { WIRE_LIMITS } from "./wire-limits";

const CAT_ACTIVITIES = [
  "enter",
  "approach",
  "pause",
  "settle",
  "sit",
  "sleep",
  "sniff",
  "paw",
  "greet",
  "chase",
  "chased",
  "bat",
  "leave",
] as const satisfies readonly CatActivity[];
const MAX_ANGLE = 4 * Math.PI;
const MAX_SPEED = 2000;
const MAX_BEND = 4;
const MAX_LEG_HEIGHT = 200;
const MAX_PRINTS = 4 * ROOM_LIMITS.maxPlayers;
const MAX_TOYS = 13;
const MAX_TRAILS = TOY_ITEMS.length;
const MAX_TRAIL_POINTS = 200;
const MAX_TOY_HEIGHT = 400;
const MAX_SPIN = 1e6;
const MAX_UNROLLED = 5000;
const MAX_SPILL_SECONDS = 3600;

function isCatActivity(value: unknown): value is CatActivity {
  return CAT_ACTIVITIES.some((activity) => activity === value);
}

function clampX(value: unknown) {
  return clampNumber({ value, min: WIRE_LIMITS.minX, max: WIRE_LIMITS.maxX });
}

function clampY(value: unknown) {
  return clampNumber({ value, min: WIRE_LIMITS.minY, max: WIRE_LIMITS.maxY });
}

function clampUnit(value: unknown) {
  return clampNumber({ value, min: 0, max: 1 });
}

function clampAngle(value: unknown) {
  return clampNumber({ value, min: -MAX_ANGLE, max: MAX_ANGLE });
}

function parseLeg(value: unknown): LegSnapshot | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const x = "x" in value ? clampX(value.x) : undefined;
  const y = "y" in value ? clampY(value.y) : undefined;
  const h =
    "h" in value
      ? clampNumber({ value: value.h, min: 0, max: MAX_LEG_HEIGHT })
      : undefined;
  return x === undefined || y === undefined || h === undefined
    ? undefined
    : { x, y, h };
}

function parseLegs(value: unknown): CatSnapshot["legs"] | undefined {
  if (!Array.isArray(value) || value.length !== 4) return undefined;
  const [a, b, c, d] = value.map(parseLeg);
  return a === undefined ||
    b === undefined ||
    c === undefined ||
    d === undefined
    ? undefined
    : [a, b, c, d];
}

function parsePose(value: unknown): CatSnapshot["pose"] | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const stand = "stand" in value ? clampUnit(value.stand) : undefined;
  const sit = "sit" in value ? clampUnit(value.sit) : undefined;
  const sleep = "sleep" in value ? clampUnit(value.sleep) : undefined;
  return stand === undefined || sit === undefined || sleep === undefined
    ? undefined
    : { stand, sit, sleep };
}

function parseCat(value: unknown): CatSnapshot | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const userId = "userId" in value ? parseWireId(value.userId) : undefined;
  const x = "x" in value ? clampX(value.x) : undefined;
  const y = "y" in value ? clampY(value.y) : undefined;
  const heading = "heading" in value ? clampAngle(value.heading) : undefined;
  const speed =
    "speed" in value
      ? clampNumber({ value: value.speed, min: 0, max: MAX_SPEED })
      : undefined;
  const bend =
    "bend" in value
      ? clampNumber({ value: value.bend, min: -MAX_BEND, max: MAX_BEND })
      : undefined;
  const pose = "pose" in value ? parsePose(value.pose) : undefined;
  const yaw = "yaw" in value ? clampAngle(value.yaw) : undefined;
  const sniff = "sniff" in value ? clampUnit(value.sniff) : undefined;
  const legs = "legs" in value ? parseLegs(value.legs) : undefined;
  if (
    userId === undefined ||
    x === undefined ||
    y === undefined ||
    heading === undefined ||
    speed === undefined ||
    bend === undefined ||
    pose === undefined ||
    yaw === undefined ||
    sniff === undefined ||
    legs === undefined ||
    !("activity" in value && isCatActivity(value.activity))
  ) {
    return undefined;
  }
  return {
    userId,
    x,
    y,
    heading,
    speed,
    bend,
    pose,
    yaw,
    sniff,
    legs,
    activity: value.activity,
  };
}

function parseSpill(value: unknown): ToySpill | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const x = "x" in value ? clampX(value.x) : undefined;
  const y = "y" in value ? clampY(value.y) : undefined;
  const seconds =
    "seconds" in value
      ? clampNumber({ value: value.seconds, min: 0, max: MAX_SPILL_SECONDS })
      : undefined;
  if (x === undefined || y === undefined || seconds === undefined)
    return undefined;
  return { x, y, seconds };
}

function parseToy(value: unknown): ToySnapshot | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const id = "id" in value ? parseWireId(value.id) : undefined;
  const x = "x" in value ? clampX(value.x) : undefined;
  const y = "y" in value ? clampY(value.y) : undefined;
  const h =
    "h" in value
      ? clampNumber({ value: value.h, min: 0, max: MAX_TOY_HEIGHT })
      : undefined;
  const angle = "angle" in value ? clampAngle(value.angle) : undefined;
  const spin =
    "spin" in value
      ? clampNumber({ value: value.spin, min: -MAX_SPIN, max: MAX_SPIN })
      : undefined;
  if (
    id === undefined ||
    x === undefined ||
    y === undefined ||
    h === undefined ||
    angle === undefined ||
    spin === undefined ||
    !("kind" in value)
  )
    return undefined;
  const place = { id, x, y, h, angle, spin };
  switch (value.kind) {
    case "yarn": {
      const left = "left" in value ? clampUnit(value.left) : undefined;
      const fade = "fade" in value ? clampUnit(value.fade) : undefined;
      if (left === undefined || fade === undefined) return undefined;
      return { ...place, kind: "yarn", left, fade };
    }
    case "box":
      return { ...place, kind: "box" };
    case "roll": {
      const unrolled =
        "unrolled" in value
          ? clampNumber({ value: value.unrolled, min: 0, max: MAX_UNROLLED })
          : undefined;
      const fade = "fade" in value ? clampUnit(value.fade) : undefined;
      if (
        unrolled === undefined ||
        fade === undefined ||
        !("isStanding" in value) ||
        typeof value.isStanding !== "boolean"
      )
        return undefined;
      return {
        ...place,
        kind: "roll",
        isStanding: value.isStanding,
        unrolled,
        fade,
      };
    }
    case "bowl":
      return {
        ...place,
        kind: "bowl",
        spill: "spill" in value ? parseSpill(value.spill) : undefined,
      };
    default:
      return undefined;
  }
}

function parseTrail(value: unknown): ToyTrail | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const toyId = "toyId" in value ? parseWireId(value.toyId) : undefined;
  if (
    toyId === undefined ||
    !("points" in value && Array.isArray(value.points))
  )
    return undefined;
  const points = value.points
    .slice(-MAX_TRAIL_POINTS)
    .flatMap((point: unknown): [number, number][] => {
      if (!Array.isArray(point)) return [];
      const x = clampX(point[0]);
      const y = clampY(point[1]);
      return x === undefined || y === undefined ? [] : [[x, y]];
    });
  return { toyId, points };
}

/** Return the cat snapshots, paw prints, toys and toy trails the host broadcast, keeping the first `ROOM_LIMITS.maxPlayers + ROOM_LIMITS.residentCats` cats, `MAX_PRINTS` prints, `MAX_TOYS` toys and `MAX_TRAILS` trails of their newest `MAX_TRAIL_POINTS` points, leaving `trails` out when the message has none, dropping malformed ones and clamping every number to its range, or `undefined` when the payload is not one. */
export function parseCatsMessage(value: unknown): CatsMessage | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const hostId = "hostId" in value ? parseWireId(value.hostId) : undefined;
  if (
    hostId === undefined ||
    !(
      "sentAt" in value &&
      typeof value.sentAt === "number" &&
      Number.isFinite(value.sentAt)
    ) ||
    !("cats" in value && Array.isArray(value.cats))
  ) {
    return undefined;
  }
  const cats = value.cats
    .slice(0, ROOM_LIMITS.maxPlayers + ROOM_LIMITS.residentCats)
    .flatMap((cat: unknown) => {
      const parsed = parseCat(cat);
      return parsed === undefined ? [] : [parsed];
    });
  const prints =
    "prints" in value && Array.isArray(value.prints)
      ? value.prints.slice(0, MAX_PRINTS).flatMap((print: unknown) => {
          const event = parseRoomEvent(print);
          return event?.kind === "pawPrint"
            ? [event satisfies PawPrintEvent]
            : [];
        })
      : [];
  const toys =
    "toys" in value && Array.isArray(value.toys)
      ? value.toys.slice(0, MAX_TOYS).flatMap((toy: unknown) => {
          const parsed = parseToy(toy);
          return parsed === undefined ? [] : [parsed];
        })
      : [];
  const trails =
    "trails" in value && Array.isArray(value.trails)
      ? value.trails.slice(0, MAX_TRAILS).flatMap((trail: unknown) => {
          const parsed = parseTrail(trail);
          return parsed === undefined ? [] : [parsed];
        })
      : undefined;
  return trails === undefined
    ? { hostId, sentAt: value.sentAt, cats, prints, toys }
    : { hostId, sentAt: value.sentAt, cats, prints, toys, trails };
}
