import type { FingerInput, World } from "@/lib/paws/sim/sim-types";
import { stepWorld } from "@/lib/paws/sim/step-world";
import type { PlayerPresence, RoomEvent } from "@/lib/paws/wire-types";

const FRAME_SECONDS = 1 / 60;

/** Step `world` at 60 steps a second for `seconds`, calling `onStep` after each step, and return every event reported. */
export function runWorld(options: {
  world: World;
  players: Pick<PlayerPresence, "userId" | "look">[];
  fingers?: FingerInput[] | ((world: World) => FingerInput[]);
  seconds: number;
  onStep?: (world: World) => void;
}) {
  const steps = Math.round(options.seconds / FRAME_SECONDS);
  return Array.from({ length: steps }).flatMap((): RoomEvent[] => {
    const fingers =
      typeof options.fingers === "function"
        ? options.fingers(options.world)
        : (options.fingers ?? []);
    const { events } = stepWorld({
      world: options.world,
      players: options.players,
      fingers,
      dtSeconds: FRAME_SECONDS,
    });
    options.onStep?.(options.world);
    return events;
  });
}
