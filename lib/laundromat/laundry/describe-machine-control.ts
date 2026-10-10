import { formatClockTime } from "./format-clock-time";
import type { MachineStatus } from "./get-machine-status";
import type { MachineRef } from "./laundry-state";

export type MachineControl = "dial" | "start" | "door";

export type NotificationAvailability =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

type ControlDescription = {
  label: string;
  tooltip: string | undefined;
  enabled: boolean;
};

/** Return the `label`, `tooltip` and whether pressing `control` on `machine` does anything in `status`. */
export function describeMachineControl(options: {
  control: MachineControl;
  machine: MachineRef;
  status: MachineStatus;
  minutes: number;
  nextMinutes: number;
  notifications: NotificationAvailability;
}): ControlDescription {
  const { machine, status, minutes } = options;
  const name = `${machine.kind === "washer" ? "Washer" : "Dryer"} ${machine.number}`;
  const noun = machine.kind === "washer" ? "wash" : "dry";
  const doneAt =
    status.kind === "running"
      ? `done at ${formatClockTime(status.endsAt)}`
      : undefined;
  switch (options.control) {
    case "dial": {
      const enabled = status.kind !== "running" && status.kind !== "done";
      return {
        label: `${name} cycle, ${minutes} minutes`,
        tooltip: enabled
          ? `turn · ${minutes} min → ${options.nextMinutes} min`
          : undefined,
        enabled,
      };
    }
    case "start": {
      if (status.kind === "loaded") {
        return {
          label: `${name} start, ${minutes} minute ${noun}`,
          tooltip: `start · ${minutes} min ${noun}`,
          enabled: true,
        };
      }
      if (status.kind === "running") {
        const canRemind =
          !status.remind &&
          (options.notifications === "default" ||
            options.notifications === "granted");
        if (canRemind) {
          return {
            label: `${name}, remind me when the ${noun} is done`,
            tooltip: `remind me · ${doneAt}`,
            enabled: true,
          };
        }
        return {
          label: `${name} start, ${status.remind ? "reminder on, " : ""}${doneAt}`,
          tooltip: status.remind ? `reminder on · ${doneAt}` : doneAt,
          enabled: false,
        };
      }
      return {
        label: `${name} start`,
        tooltip: status.kind === "loadable" ? "load laundry first" : undefined,
        enabled: false,
      };
    }
    case "door": {
      const tooltip = (() => {
        switch (status.kind) {
          case "running":
            return `${machine.kind === "washer" ? "washing" : "drying"} · ${doneAt}`;
          case "done":
            return "open door · take laundry out";
          case "loaded":
            return "open door · take laundry back out";
          case "loadable":
            return "load laundry";
          case "unavailable":
            return undefined;
          default: {
            const unhandled: never = status;
            return unhandled;
          }
        }
      })();
      return {
        label:
          tooltip === undefined ? `${name} door` : `${name} door, ${tooltip}`,
        tooltip,
        enabled:
          status.kind === "done" ||
          status.kind === "loaded" ||
          status.kind === "loadable",
      };
    }
    default: {
      const unhandled: never = options.control;
      return unhandled;
    }
  }
}
