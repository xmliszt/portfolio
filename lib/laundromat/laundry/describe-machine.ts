import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import { formatClockTime } from "./format-clock-time";
import { formatRemainingTime } from "./format-remaining-time";
import type { MachineStatus } from "./get-machine-status";
import type { MachineRef } from "./laundry-state";

/** Return the hit target `label` and `tooltip` for the body of `machine` in `status`. */
export function describeMachine(options: {
  machine: MachineRef;
  status: MachineStatus;
  copy: LaundromatCopy;
}) {
  const { machine, status } = options;
  const copy = options.copy.machine;
  const name = copy.name(machine);
  const tooltipName = name.toLocaleLowerCase(options.copy.locale);
  const { kind } = machine;
  switch (status.kind) {
    case "unavailable":
    case "loadable":
      return {
        label: copy.freeLabel({ name }),
        tooltip: copy.freeTooltip({ name: tooltipName }),
      };
    case "loaded":
      return {
        label: copy.loadedLabel({ name }),
        tooltip: copy.loadedTooltip({ name: tooltipName }),
      };
    case "running":
      return {
        label: copy.runningLabel({
          name,
          kind,
          remaining: formatRemainingTime(status.remainingMs),
        }),
        tooltip: copy.runningTooltip({
          kind,
          time: formatClockTime({
            timestampMs: status.endsAt,
            locale: options.copy.locale,
          }),
        }),
      };
    case "done":
      return {
        label: copy.doneLabel({ name }),
        tooltip: copy.doneTooltip({ name: tooltipName }),
      };
    case "occupied":
      if (status.phase === "loaded") {
        return {
          label: copy.othersLoadedLabel({ name }),
          tooltip: copy.othersLoadedTooltip({ name: tooltipName }),
        };
      }
      return status.phase === "running"
        ? {
            label: copy.othersRunningLabel({
              name,
              kind,
              remaining: formatRemainingTime(status.remainingMs),
            }),
            tooltip: copy.othersRunningTooltip({
              kind,
              time: formatClockTime({
                timestampMs: status.endsAt,
                locale: options.copy.locale,
              }),
            }),
          }
        : {
            label: copy.othersDoneLabel({ name }),
            tooltip: copy.othersDoneTooltip({ name: tooltipName }),
          };
    default: {
      const unhandled: never = status;
      return unhandled;
    }
  }
}
