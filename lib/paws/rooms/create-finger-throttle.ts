import type { FingerMessage } from "@/lib/paws/wire-types";

/** Return a throttle that passes fingertips to `send` at most `sendsPerSecond` times a second while the finger moves, sending the latest one when the wait ends, and sends a press or release at once. */
export function createFingerThrottle(options: {
  sendsPerSecond: number;
  now: () => number;
  schedule: (options: { run: () => void; delayMs: number }) => () => void;
  send: (finger: FingerMessage) => void;
}) {
  const intervalMs = 1000 / options.sendsPerSecond;
  const state: {
    lastSent?: { finger: FingerMessage; at: number };
    pending?: FingerMessage;
    cancelTimer?: () => void;
  } = {};

  function sendNow(finger: FingerMessage) {
    state.cancelTimer?.();
    state.cancelTimer = undefined;
    state.pending = undefined;
    state.lastSent = { finger, at: options.now() };
    options.send(finger);
  }

  return {
    push(finger: FingerMessage) {
      const lastSent = state.lastSent;
      const now = options.now();
      if (
        lastSent === undefined ||
        lastSent.finger.pressed !== finger.pressed ||
        now - lastSent.at >= intervalMs
      ) {
        sendNow(finger);
        return;
      }
      state.pending = finger;
      if (state.cancelTimer !== undefined) return;
      state.cancelTimer = options.schedule({
        delayMs: lastSent.at + intervalMs - now,
        run: () => {
          state.cancelTimer = undefined;
          if (state.pending !== undefined) sendNow(state.pending);
        },
      });
    },
    dispose() {
      state.cancelTimer?.();
      state.cancelTimer = undefined;
      state.pending = undefined;
    },
  };
}
