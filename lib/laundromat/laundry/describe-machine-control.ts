import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import { formatClockTime } from "./format-clock-time";
import type { MachineStatus, UnavailableReason } from "./get-machine-status";
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

function describeUnavailableReason(options: {
  reason: UnavailableReason;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.machineControl;
  const { reason } = options;
  switch (reason.kind) {
    case "needs-washing":
      return copy.needsWashingTooltip;
    case "already-washed":
      return copy.alreadyWashedTooltip;
    case "already-dry":
      return copy.alreadyDryTooltip;
    case "elsewhere": {
      const name = options.copy.machine
        .name(reason.machine)
        .toLocaleLowerCase(options.copy.locale);
      switch (reason.phase) {
        case "loaded":
          return copy.elsewhereLoadedTooltip({ name });
        case "running":
          return copy.elsewhereRunningTooltip({ kind: reason.machine.kind });
        case "done":
          return copy.elsewhereDoneTooltip({ name });
        default: {
          const unhandled: never = reason.phase;
          return unhandled;
        }
      }
    }
    default: {
      const unhandled: never = reason;
      return unhandled;
    }
  }
}

/** Return the `label`, `tooltip` and whether pressing `control` on `machine` does anything in `status`. */
export function describeMachineControl(options: {
  control: MachineControl;
  machine: MachineRef;
  status: MachineStatus;
  minutes: number;
  nextMinutes: number;
  notifications: NotificationAvailability;
  copy: LaundromatCopy;
}): ControlDescription {
  const { machine, status, minutes } = options;
  const { kind } = machine;
  const copy = options.copy.machineControl;
  const name = options.copy.machine.name(machine);
  const doneAt =
    status.kind === "running"
      ? copy.doneAt({
          time: formatClockTime({
            timestampMs: status.endsAt,
            locale: options.copy.locale,
          }),
        })
      : "";
  if (status.kind === "occupied") {
    const tooltip = (() => {
      switch (status.phase) {
        case "loaded":
          return copy.othersLoadedTooltip;
        case "running":
          return copy.othersRunningTooltip({
            kind,
            time: formatClockTime({
              timestampMs: status.endsAt,
              locale: options.copy.locale,
            }),
          });
        case "done":
          return copy.othersDoneTooltip;
        default: {
          const unhandled: never = status;
          return unhandled;
        }
      }
    })();
    return {
      label: copy.controlInUseLabel({ name, control: options.control }),
      tooltip,
      enabled: false,
    };
  }
  switch (options.control) {
    case "dial": {
      const enabled = status.kind !== "running" && status.kind !== "done";
      return {
        label: copy.dialLabel({ name, minutes }),
        tooltip: enabled
          ? copy.dialTooltip({ minutes, nextMinutes: options.nextMinutes })
          : undefined,
        enabled,
      };
    }
    case "start": {
      if (status.kind === "loaded") {
        const canNotify =
          options.notifications === "default" ||
          options.notifications === "granted";
        return {
          label: copy.startLabel({ name, kind, minutes, canNotify }),
          tooltip: copy.startTooltip({ kind, minutes, canNotify }),
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
            label: copy.remindLabel({ name, kind }),
            tooltip: copy.remindTooltip({ doneAt }),
            enabled: true,
          };
        }
        return {
          label: copy.runningStartLabel({
            name,
            reminderOn: status.remind,
            doneAt,
          }),
          tooltip: status.remind ? copy.reminderOnTooltip({ doneAt }) : doneAt,
          enabled: false,
        };
      }
      return {
        label: copy.idleStartLabel({ name }),
        tooltip: (() => {
          switch (status.kind) {
            case "loadable":
              return copy.loadFirstTooltip;
            case "done":
              return undefined;
            case "unavailable":
              return describeUnavailableReason({
                reason: status.reason,
                copy: options.copy,
              });
            default: {
              const unhandled: never = status;
              return unhandled;
            }
          }
        })(),
        enabled: false,
      };
    }
    case "door": {
      const tooltip = (() => {
        switch (status.kind) {
          case "running":
            return copy.runningDoorTooltip({ kind, doneAt });
          case "done":
            return copy.doneDoorTooltip;
          case "loaded":
            return copy.loadedDoorTooltip;
          case "loadable":
            return copy.loadableDoorTooltip;
          case "unavailable":
            return describeUnavailableReason({
              reason: status.reason,
              copy: options.copy,
            });
          default: {
            const unhandled: never = status;
            return unhandled;
          }
        }
      })();
      return {
        label:
          tooltip === undefined
            ? copy.doorLabel({ name })
            : copy.doorLabelWithHint({ name, hint: tooltip }),
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
