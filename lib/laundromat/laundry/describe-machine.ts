import { formatClockTime } from "./format-clock-time";
import { formatRemainingTime } from "./format-remaining-time";
import type { MachineStatus } from "./get-machine-status";
import type { MachineRef } from "./laundry-state";

/** Return the hit target `label` and `tooltip` for the body of `machine` in `status`. */
export function describeMachine(options: {
  machine: MachineRef;
  status: MachineStatus;
}) {
  const { machine, status } = options;
  const name = `${machine.kind === "washer" ? "Washer" : "Dryer"} ${machine.number}`;
  const tooltipName = name.toLowerCase();
  switch (status.kind) {
    case "unavailable":
    case "loadable":
      return { label: `${name}, free`, tooltip: `${tooltipName} · free` };
    case "loaded":
      return {
        label: `${name}, loaded, ready to start`,
        tooltip: `${tooltipName} · loaded`,
      };
    case "running": {
      const verb = machine.kind === "washer" ? "washing" : "drying";
      return {
        label: `${name}, ${verb}, ${formatRemainingTime(status.remainingMs)} left`,
        tooltip: `${verb} · done at ${formatClockTime(status.endsAt)}`,
      };
    }
    case "done":
      return {
        label: `${name}, done, take your laundry out`,
        tooltip: `${tooltipName} · done`,
      };
    default: {
      const unhandled: never = status;
      return unhandled;
    }
  }
}
