import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";

import { MAX_GOLDEN_CHARGES } from "./max-golden-charges";
import { MAX_WRITING_MS } from "./max-writing-ms";
import { parseRoomRegion } from "./parse-room-region";
import type {
  GoldenCharge,
  RemoteFlask,
  RemoteLoad,
  RoomPresence,
} from "./room-presence";

const MAX_CLOCK_SKEW_MS = 60_000;
const MAX_CYCLE_MS = 2 * 60 * 60_000;
const MAX_MACHINE_ID_LENGTH = 40;
const MAX_FLASK_PORTIONS = 20;
const MAX_ID_LENGTH = 64;

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

function parseLoad(value: unknown): RemoteLoad | undefined {
  if (
    !isObject(value) ||
    !("kind" in value) ||
    (value.kind !== "washer" && value.kind !== "dryer")
  ) {
    return undefined;
  }
  const machine =
    "machineId" in value &&
    typeof value.machineId === "string" &&
    value.machineId.length <= MAX_MACHINE_ID_LENGTH
      ? { machineId: value.machineId }
      : {};
  // A load without `phase` comes from a tab that only ever shared running cycles.
  const phase = "phase" in value ? value.phase : "running";
  if (phase === "loaded" || phase === "done") {
    return { phase, kind: value.kind, ...machine };
  }
  if (
    phase !== "running" ||
    !("startedAt" in value && typeof value.startedAt === "number") ||
    !("durationMs" in value && typeof value.durationMs === "number") ||
    value.durationMs <= 0 ||
    value.durationMs > MAX_CYCLE_MS
  ) {
    return undefined;
  }
  return {
    phase: "running",
    kind: value.kind,
    ...machine,
    startedAt: value.startedAt,
    durationMs: value.durationMs,
  };
}

function parseId(value: unknown) {
  return typeof value === "string" && value.length <= MAX_ID_LENGTH
    ? value
    : undefined;
}

function parseFlask(options: {
  value: unknown;
  now: number;
}): RemoteFlask | undefined {
  const { value, now } = options;
  if (
    !isObject(value) ||
    !("portions" in value && typeof value.portions === "number") ||
    !Number.isInteger(value.portions) ||
    value.portions < 0 ||
    value.portions > MAX_FLASK_PORTIONS ||
    !("changedAt" in value && typeof value.changedAt === "number") ||
    value.changedAt > now + MAX_CLOCK_SKEW_MS
  ) {
    return undefined;
  }
  const brewStartedAt =
    "brewStartedAt" in value && typeof value.brewStartedAt === "number"
      ? value.brewStartedAt
      : undefined;
  if (brewStartedAt !== undefined && brewStartedAt > value.changedAt) {
    return undefined;
  }
  const brewedBy = "brewedBy" in value ? parseId(value.brewedBy) : undefined;
  const hotUntil =
    "hotUntil" in value && typeof value.hotUntil === "number"
      ? { hotUntil: value.hotUntil }
      : {};
  return {
    portions: value.portions,
    ...(brewStartedAt === undefined ? {} : { brewStartedAt }),
    ...hotUntil,
    ...(brewedBy === undefined ? {} : { brewedBy }),
    changedAt: value.changedAt,
  };
}

function parseGoldenCharge(options: {
  value: unknown;
  now: number;
}): GoldenCharge | undefined {
  const { value, now } = options;
  if (
    !isObject(value) ||
    !("machineId" in value && typeof value.machineId === "string") ||
    value.machineId.length > MAX_MACHINE_ID_LENGTH ||
    !("startedAt" in value && typeof value.startedAt === "number") ||
    value.startedAt > now + MAX_CLOCK_SKEW_MS ||
    value.startedAt < now - GOLDEN_CHARGE_MS.max - MAX_CLOCK_SKEW_MS
  ) {
    return undefined;
  }
  return { machineId: value.machineId, startedAt: value.startedAt };
}

/** Return the presence another tab tracked on the room channel, or `undefined` when it is not one; unknown or malformed fields are dropped, and so is a `flask` changed more than `MAX_CLOCK_SKEW_MS` after `now` or brewing after it changed, a `writingSince` in the future or older than `MAX_WRITING_MS` by `now`, and any of the last `MAX_GOLDEN_CHARGES` `goldenCharges` that starts in the future or ended before `now`, each beyond `MAX_CLOCK_SKEW_MS`. */
export function parseRoomPresence(options: {
  value: unknown;
  now: number;
}): RoomPresence | undefined {
  const { value, now } = options;
  if (
    !isObject(value) ||
    !("sessionId" in value && typeof value.sessionId === "string") ||
    !("visitorId" in value && typeof value.visitorId === "string")
  ) {
    return undefined;
  }
  const load = "load" in value ? parseLoad(value.load) : undefined;
  const coffeeGroupId =
    "coffeeGroupId" in value ? parseId(value.coffeeGroupId) : undefined;
  const flask =
    "flask" in value ? parseFlask({ value: value.flask, now }) : undefined;
  const region =
    "region" in value && isObject(value.region)
      ? parseRoomRegion({
          latitude: "latDeg" in value.region ? value.region.latDeg : undefined,
          longitude: "lonDeg" in value.region ? value.region.lonDeg : undefined,
        })
      : undefined;
  const writingSince =
    "writingSince" in value &&
    typeof value.writingSince === "number" &&
    value.writingSince <= now + MAX_CLOCK_SKEW_MS &&
    value.writingSince >= now - MAX_WRITING_MS
      ? value.writingSince
      : undefined;
  const goldenCharges =
    "goldenCharges" in value && Array.isArray(value.goldenCharges)
      ? value.goldenCharges
          .slice(-MAX_GOLDEN_CHARGES)
          .flatMap((charge: unknown) => {
            const parsed = parseGoldenCharge({ value: charge, now });
            return parsed === undefined ? [] : [parsed];
          })
      : [];
  return {
    sessionId: value.sessionId,
    visitorId: value.visitorId,
    ...(region === undefined ? {} : { region }),
    ...(load === undefined ? {} : { load }),
    ...(coffeeGroupId === undefined ? {} : { coffeeGroupId }),
    ...(flask === undefined ? {} : { flask }),
    ...(writingSince === undefined ? {} : { writingSince }),
    ...(goldenCharges.length === 0 ? {} : { goldenCharges }),
  };
}
