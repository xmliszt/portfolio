import { GOLDEN_CHARGE_MS } from "./golden-charge-ms";
import type { OwnGoldenCharge } from "./tip-token";

/** Return which of this visitor's `charges` start running now (their machine is in `ownRunningMachineIds` and has not run yet) and which end: one whose cycle ran and stopped, one never run after `GOLDEN_CHARGE_MS.idle`, and any past `GOLDEN_CHARGE_MS.max`. */
export function getChargeChanges(options: {
  charges: OwnGoldenCharge[];
  ownRunningMachineIds: string[];
  now: number;
}) {
  const { charges, ownRunningMachineIds, now } = options;
  const isPastMax = ({ startedAt }: OwnGoldenCharge) =>
    now - startedAt > GOLDEN_CHARGE_MS.max;
  const isRunning = ({ machineId }: OwnGoldenCharge) =>
    ownRunningMachineIds.includes(machineId);
  const ran = charges
    .filter(
      (charge) =>
        !isPastMax(charge) && isRunning(charge) && charge.ranAt === undefined
    )
    .map(({ machineId }) => machineId);
  const ended = charges
    .filter(
      (charge) =>
        isPastMax(charge) ||
        (!isRunning(charge) &&
          (charge.ranAt !== undefined ||
            now - charge.startedAt > GOLDEN_CHARGE_MS.idle))
    )
    .map(({ machineId }) => machineId);
  return { ran, ended };
}
