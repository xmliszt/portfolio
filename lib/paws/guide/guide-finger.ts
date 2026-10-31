import type { GuideFinger } from "./guide-types";

/** Return a fingertip shown from `inAt` until `outAt` at `path(t)`, pressed during each of `presses`. */
export function guideFinger(options: {
  userId: string;
  own: boolean;
  inAt: number;
  outAt: number;
  presses: [number, number][];
  path: (t: number) => { x: number; y: number };
}): GuideFinger {
  return {
    userId: options.userId,
    own: options.own,
    at: (t) =>
      t < options.inAt || t > options.outAt
        ? undefined
        : {
            ...options.path(t),
            pressed: options.presses.some(([from, to]) => t >= from && t < to),
          },
  };
}
