import type { SimCat, Tick } from "./sim-types";

const QUIET_SECONDS = 3;

/** Report `sound` from `cat` unless it made one in the last few seconds; return `true` if it was reported. */
export function emitCatSound(options: {
  tick: Tick;
  cat: SimCat;
  sound: "meow" | "trill" | "purr" | "lick";
}) {
  const { tick, cat } = options;
  if (tick.world.time < cat.quietUntil) return false;
  cat.quietUntil = tick.world.time + QUIET_SECONDS;
  tick.events.push({ kind: "sound", userId: cat.userId, sound: options.sound });
  return true;
}
