import type { LoopHandle } from "./voice-options";

/** Return a handle whose `stop` fades `output` to silence over `fadeMs`, cancels `events`, then stops `sources` and disconnects `output`. */
export function createLoopHandle(options: {
  context: AudioContext;
  output: GainNode;
  sources: AudioScheduledSourceNode[];
  events: { cancel(): void }[];
}): LoopHandle {
  const state = { stopped: false };
  return {
    stop(fadeMs) {
      if (state.stopped) return;
      state.stopped = true;
      options.events.forEach((event) => event.cancel());
      const nowS = options.context.currentTime;
      const gain = options.output.gain;
      const currentGain = gain.value;
      gain.cancelScheduledValues(nowS);
      gain.setValueAtTime(currentGain, nowS);
      gain.linearRampToValueAtTime(0, nowS + fadeMs / 1000);
      setTimeout(() => {
        options.sources.forEach((source) => source.stop());
        options.output.disconnect();
      }, fadeMs + 50);
    },
  };
}
