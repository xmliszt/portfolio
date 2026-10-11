import { MAX_WRITING_MS } from "./max-writing-ms";
import { parseRoomRegion } from "./parse-room-region";
import type { RemoteLoad, RoomPresence } from "./room-presence";

const MAX_CLOCK_SKEW_MS = 60_000;
const MAX_CYCLE_MS = 2 * 60 * 60_000;
const MAX_MACHINE_ID_LENGTH = 40;

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

/** Return the presence another tab tracked on the room channel, or `undefined` when it is not one; unknown or malformed fields are dropped, and so is a `writingSince` in the future or older than `MAX_WRITING_MS` by `now`. */
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
  return {
    sessionId: value.sessionId,
    visitorId: value.visitorId,
    ...(region === undefined ? {} : { region }),
    ...(load === undefined ? {} : { load }),
    ...(writingSince === undefined ? {} : { writingSince }),
  };
}
