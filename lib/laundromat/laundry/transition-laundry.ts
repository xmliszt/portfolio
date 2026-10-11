import { getCycleMinutes } from "./get-cycle-minutes";
import type {
  LaundryEvent,
  LaundryLoad,
  LaundryState,
  MachineCycles,
  MachineRef,
} from "./laundry-state";

const MS_PER_MINUTE = 60_000;

function openDoor(options: { load: LaundryLoad; machine: MachineRef }) {
  const { load, machine } = options;
  switch (load.kind) {
    case "carrying":
    case "folded": {
      const laundry = load.kind === "carrying" ? load.laundry : "clean";
      const fits =
        machine.kind === "washer" ? laundry !== "wet" : laundry === "wet";
      return fits ? ({ kind: "loaded", machine } satisfies LaundryLoad) : load;
    }
    case "loaded":
      if (load.machine.id !== machine.id) return load;
      return {
        kind: "carrying",
        laundry: machine.kind === "washer" ? "dirty" : "wet",
      } satisfies LaundryLoad;
    case "done":
      if (load.machine.id !== machine.id) return load;
      return machine.kind === "washer"
        ? ({ kind: "carrying", laundry: "wet" } satisfies LaundryLoad)
        : ({ kind: "folded" } satisfies LaundryLoad);
    case "running":
      return load;
    default: {
      const unhandled: never = load;
      return unhandled;
    }
  }
}

/** Return the laundry state after `event`, or `state` itself when the event does nothing in it. */
export function transitionLaundry(options: {
  state: LaundryState;
  event: LaundryEvent;
  machines: MachineCycles;
}): LaundryState {
  const { state, event } = options;
  const { load } = state;
  switch (event.type) {
    case "open-door": {
      const next = openDoor({ load, machine: event.machine });
      return next === load ? state : { ...state, load: next };
    }
    case "turn-dial": {
      const isLocked =
        (load.kind === "running" || load.kind === "done") &&
        load.machine.id === event.machine.id;
      if (isLocked) return state;
      const cycle = getCycleMinutes({
        state,
        machine: event.machine,
        machines: options.machines,
      });
      const minutes = event.step === 1 ? cycle.next : cycle.previous;
      return {
        ...state,
        cycleMinutes: { ...state.cycleMinutes, [event.machine.id]: minutes },
      };
    }
    case "start": {
      if (load.kind !== "loaded" || load.machine.id !== event.machine.id) {
        return state;
      }
      const { minutes } = getCycleMinutes({
        state,
        machine: load.machine,
        machines: options.machines,
      });
      return {
        ...state,
        load: {
          kind: "running",
          machine: load.machine,
          startedAt: event.now,
          durationMs: minutes * MS_PER_MINUTE,
          remind: false,
        },
      };
    }
    case "remind":
      if (
        load.kind !== "running" ||
        load.machine.id !== event.machine.id ||
        load.remind
      ) {
        return state;
      }
      return { ...state, load: { ...load, remind: true } };
    case "collect": {
      const isFinished =
        load.kind === "folded" ||
        (load.kind === "carrying" && load.laundry === "wet");
      return isFinished
        ? { ...state, load: { kind: "carrying", laundry: "dirty" } }
        : state;
    }
    case "tick":
      if (
        load.kind !== "running" ||
        event.now < load.startedAt + load.durationMs
      ) {
        return state;
      }
      return { ...state, load: { kind: "done", machine: load.machine } };
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}
