import type { LaundryState, MachineCycles, MachineRef } from "./laundry-state";

/** Return the `minutes` `machine` is set to, falling back to the kind's default when unset or no longer a choice, its `detent` index, and the `next` and `previous` detents. */
export function getCycleMinutes(options: {
  state: LaundryState;
  machine: MachineRef;
  machines: MachineCycles;
}) {
  const { machines, machine } = options;
  const choices =
    machine.kind === "washer"
      ? machines.washerCycleMinutes
      : machines.dryerCycleMinutes;
  const fallback =
    machine.kind === "washer"
      ? machines.defaultWasherCycleMinutes
      : machines.defaultDryerCycleMinutes;
  const stored = options.state.cycleMinutes[machine.id];
  const minutes =
    stored !== undefined && choices.includes(stored) ? stored : fallback;
  const index = choices.indexOf(minutes);
  function at(offset: number) {
    return (
      choices.at((index + offset + choices.length) % choices.length) ?? minutes
    );
  }
  return { minutes, detent: index, next: at(1), previous: at(-1) };
}
