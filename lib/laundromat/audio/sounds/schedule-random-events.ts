import { randomBetween } from "./random-between";

const LOOKAHEAD_S = 0.05;

/** Call `onEvent` with a context start time again and again, `minIntervalMs` to `maxIntervalMs` apart, until the returned `cancel` is called. */
export function scheduleRandomEvents(options: {
  context: AudioContext;
  minIntervalMs: number;
  maxIntervalMs: number;
  onEvent: (startTimeS: number) => void;
}) {
  const state: { timer?: ReturnType<typeof setTimeout> } = {};

  function scheduleNext() {
    const delayMs = randomBetween({
      min: options.minIntervalMs,
      max: options.maxIntervalMs,
    });
    state.timer = setTimeout(() => {
      // A suspended context's clock is frozen, so events queued now would all fire together on resume.
      if (options.context.state === "running") {
        options.onEvent(options.context.currentTime + LOOKAHEAD_S);
      }
      scheduleNext();
    }, delayMs);
  }

  scheduleNext();
  return {
    cancel() {
      clearTimeout(state.timer);
    },
  };
}
