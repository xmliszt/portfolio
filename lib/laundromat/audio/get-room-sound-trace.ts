import type { RoomSoundGroup } from "./room-sound-groups";

function hashNoise(seed: number) {
  const value = Math.sin(seed) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

/** Return the height, from -1 to 1, of `group`'s scope trace at `x` (0 at the left edge, 1 at the right) and `timeS` seconds. */
export function getRoomSoundTrace(options: {
  group: RoomSoundGroup;
  x: number;
  timeS: number;
}) {
  const { x, timeS } = options;
  switch (options.group) {
    case "machines":
      return (
        Math.sin(x * 9 + timeS * 4) * 0.55 + Math.sin(x * 23 - timeS * 7) * 0.15
      );
    case "shop-bell":
      return (
        Math.sin(x * 70 + timeS * 10) *
        Math.exp(-((x * 3 + timeS * 0.8) % 3)) *
        0.9
      );
    case "unloading": {
      const centre = ((timeS * 0.6) % 1.6) - 0.3;
      return Math.exp(-((x - centre) ** 2) * 120) * Math.sin(x * 90) * 0.9;
    }
    case "coffee":
      return Math.max(0, Math.sin(x * 14 - timeS * 5)) ** 6 * 0.9 - 0.1;
    case "tv":
      return hashNoise(x * 129.898 + Math.floor(timeS * 30) * 78.233) * 0.6;
    case "lamp":
      return (
        (Math.sin(x * 20 + timeS * 2) > 0 ? 0.45 : -0.45) *
        (0.6 + 0.4 * Math.sin(timeS * 13))
      );
    default: {
      const unknown: never = options.group;
      return unknown;
    }
  }
}
