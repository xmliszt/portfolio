import type { MachineKind, SceneConfig } from "@/lib/laundromat/scene-config";

export type MachineRef = { id: string; kind: MachineKind; number: number };

export type LaundryLoad =
  | { kind: "carrying"; laundry: "dirty" | "wet" }
  | { kind: "folded" }
  | { kind: "loaded"; machine: MachineRef }
  | {
      kind: "running";
      machine: MachineRef;
      startedAt: number;
      durationMs: number;
      remind: boolean;
    }
  | { kind: "done"; machine: MachineRef };

export type LaundryState = {
  load: LaundryLoad;
  cycleMinutes: { [machineId: string]: number };
};

export type LaundryEvent =
  | { type: "open-door"; machine: MachineRef }
  | { type: "turn-dial"; machine: MachineRef; step: 1 | -1 }
  | { type: "start"; machine: MachineRef; now: number }
  | { type: "remind"; machine: MachineRef }
  | { type: "tick"; now: number };

export type MachineCycles = SceneConfig["machines"];

export const INITIAL_LAUNDRY_STATE: LaundryState = {
  load: { kind: "carrying", laundry: "dirty" },
  cycleMinutes: {},
};
