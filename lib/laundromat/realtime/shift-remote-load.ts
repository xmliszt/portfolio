import type { RemoteLoad } from "./room-presence";

/** Return `load` with a running cycle's `startedAt` moved onto the local clock by `offsetMs` (local time minus the sender's); other phases come back unchanged. */
export function shiftRemoteLoad(options: {
  load: RemoteLoad;
  offsetMs: number;
}) {
  const { load } = options;
  return load.phase === "running"
    ? { ...load, startedAt: load.startedAt + options.offsetMs }
    : load;
}
