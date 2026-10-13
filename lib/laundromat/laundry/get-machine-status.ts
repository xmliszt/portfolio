import type { LaundryState, MachineRef } from "./laundry-state";

export type UnavailableReason =
  | { kind: "needs-washing" }
  | { kind: "already-washed" }
  | { kind: "already-dry" }
  | {
      kind: "elsewhere";
      machine: MachineRef;
      phase: "loaded" | "running" | "done";
    };

export type MachineStatus =
  | { kind: "unavailable"; reason: UnavailableReason }
  | { kind: "loadable" }
  | { kind: "loaded" }
  | { kind: "running"; endsAt: number; remainingMs: number; remind: boolean }
  | { kind: "done" }
  | { kind: "occupied"; phase: "loaded" }
  | { kind: "occupied"; phase: "running"; endsAt: number; remainingMs: number }
  | { kind: "occupied"; phase: "done" };

/** Return what `machine` can do right now for this visitor's laundry, and why it can't take it when `unavailable`. */
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
      if (fits) return { kind: "loadable" };
      if (machine.kind === "washer") {
        return { kind: "unavailable", reason: { kind: "already-washed" } };
      }
      return {
        kind: "unavailable",
        reason: {
          kind: load.kind === "folded" ? "already-dry" : "needs-washing",
        },
      };
    }
    case "loaded":
    case "done":
      if (load.machine.id === machine.id) return { kind: load.kind };
      return {
        kind: "unavailable",
        reason: { kind: "elsewhere", machine: load.machine, phase: load.kind },
      };
    case "running": {
      if (load.machine.id !== machine.id) {
        return {
          kind: "unavailable",
          reason: {
            kind: "elsewhere",
            machine: load.machine,
            phase: "running",
          },
        };
      }
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
