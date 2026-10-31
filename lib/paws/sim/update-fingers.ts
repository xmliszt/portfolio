import { damp } from "./damp";
import type { FingerInput, World } from "./sim-types";

const FORGET_SECONDS = 10;

/** Record where each finger in `inputs` is now, how fast it moves and how long it has been still; fingers missing from `inputs` are marked absent and forgotten after a while. */
export function updateFingers(options: {
  world: World;
  inputs: FingerInput[];
  dtSeconds: number;
}) {
  const { world, inputs, dtSeconds } = options;
  const presentIds = new Set(inputs.map((input) => input.userId));
  for (const input of inputs) {
    const previous = world.fingers[input.userId];
    const moved =
      previous?.present === true
        ? Math.hypot(input.x - previous.x, input.y - previous.y)
        : 0;
    world.fingers[input.userId] = {
      userId: input.userId,
      x: input.x,
      y: input.y,
      pressed: input.pressed,
      present: true,
      speed: damp({
        from: previous?.speed ?? 0,
        to: moved / Math.max(dtSeconds, 0.001),
        rate: 10,
        dtSeconds,
      }),
      stillSeconds: moved > 1.5 ? 0 : (previous?.stillSeconds ?? 0) + dtSeconds,
      absentSeconds: 0,
    };
  }
  for (const finger of Object.values(world.fingers)) {
    if (presentIds.has(finger.userId)) continue;
    finger.present = false;
    finger.pressed = false;
    finger.absentSeconds += dtSeconds;
    if (finger.absentSeconds > FORGET_SECONDS)
      delete world.fingers[finger.userId];
  }
}
