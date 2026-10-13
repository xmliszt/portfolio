import type { CoffeeFlask, CoffeeTiming } from "./coffee-state";
import type { CoffeePhase } from "./get-coffee-phase";
import { getCoffeePhase } from "./get-coffee-phase";
import { getFlaskClockOffsetMs } from "./get-flask-clock-offset-ms";

/** Return the phase of a shared `flask` at local `now`, reading its brew times on the clock of whoever brewed it and giving `doneAt` back on the local clock. */
export function getSharedCoffeePhase(options: {
  flask: CoffeeFlask;
  now: number;
  timing: CoffeeTiming;
  ownVisitorId: string | undefined;
  clockOffsetsMs: { [visitorId: string]: number };
}): CoffeePhase {
  const offsetMs = getFlaskClockOffsetMs(options);
  const phase = getCoffeePhase({ ...options, now: options.now - offsetMs });
  return phase.kind === "brewing"
    ? { ...phase, doneAt: phase.doneAt + offsetMs }
    : phase;
}
