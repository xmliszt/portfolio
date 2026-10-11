import type { LaundryState, MachineRef } from "./laundry-state";

export type MachineStatus =
  | { kind: "unavailable" }
  | { kind: "loadable" }
  | { kind: "loaded" }
  | { kind: "running"; endsAt: number; remainingMs: number; remind: boolean }
  | { kind: "done" }
  | { kind: "occupied"; endsAt: number; remainingMs: number };

/** Return what `machine` can do right now for this visitor's laundry. */
export function getMachineStatus(options: {
  state: LaundryState;
  machine: MachineRef;
  now: number;
}): MachineStatus {
  const { load } = options.state;
  const { machine } = options;
  switch (load.kind) {
    case "carrying":
    case "folded": {
      const isWet = load.kind === "carrying" && load.laundry === "wet";
      const fits = machine.kind === "washer" ? !isWet : isWet;
      return { kind: fits ? "loadable" : "unavailable" };
    }
    case "loaded":
    case "done":
      return {
        kind: load.machine.id === machine.id ? load.kind : "unavailable",
      };
    case "running": {
      if (load.machine.id !== machine.id) return { kind: "unavailable" };
      const endsAt = load.startedAt + load.durationMs;
      return {
        kind: "running",
        endsAt,
        remainingMs: Math.max(0, endsAt - options.now),
        remind: load.remind,
      };
    }
    default: {
      const unhandled: never = load;
      return unhandled;
    }
  }
}
