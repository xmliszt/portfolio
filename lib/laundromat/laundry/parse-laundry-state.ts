import type { LaundryLoad, LaundryState, MachineRef } from "./laundry-state";

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

function parseMachine(value: unknown): MachineRef | undefined {
  if (
    !isObject(value) ||
    !("id" in value && typeof value.id === "string") ||
    !("number" in value && typeof value.number === "number") ||
    !("kind" in value) ||
    (value.kind !== "washer" && value.kind !== "dryer")
  ) {
    return undefined;
  }
  return { id: value.id, kind: value.kind, number: value.number };
}

function parseLoad(value: unknown): LaundryLoad | undefined {
  if (!isObject(value) || !("kind" in value)) return undefined;
  if (value.kind === "folded") return { kind: "folded" };
  if (value.kind === "carrying") {
    if (!("laundry" in value)) return undefined;
    if (value.laundry !== "dirty" && value.laundry !== "wet") return undefined;
    return { kind: "carrying", laundry: value.laundry };
  }
  const machine = "machine" in value ? parseMachine(value.machine) : undefined;
  if (machine === undefined) return undefined;
  if (value.kind === "loaded" || value.kind === "done") {
    return { kind: value.kind, machine };
  }
  if (
    value.kind !== "running" ||
    !("startedAt" in value && typeof value.startedAt === "number") ||
    !("durationMs" in value && typeof value.durationMs === "number") ||
    !("remind" in value && typeof value.remind === "boolean")
  ) {
    return undefined;
  }
  return {
    kind: "running",
    machine,
    startedAt: value.startedAt,
    durationMs: value.durationMs,
    remind: value.remind,
  };
}

/** Return the laundry state stored as `json`, or `undefined` when it is missing or not a valid state. */
export function parseLaundryState(
  json: string | null
): LaundryState | undefined {
  if (json === null) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return undefined;
  }
  if (!isObject(value) || !("load" in value) || !("cycleMinutes" in value)) {
    return undefined;
  }
  const load = parseLoad(value.load);
  if (load === undefined || !isObject(value.cycleMinutes)) return undefined;
  const cycleMinutes = Object.fromEntries(
    Object.entries(value.cycleMinutes).filter(
      (entry): entry is [string, number] => typeof entry[1] === "number"
    )
  );
  return { load, cycleMinutes };
}
