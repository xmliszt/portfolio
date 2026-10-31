import type { BabbleSyllable } from "./get-babble-syllables";

const SHORT_PAUSE_SHARE = 1.2;
const LONG_PAUSE_SHARE = 2.5;

/** Return when each of `syllables` starts, in seconds from the first, with a voiced syllable lasting `syllableSeconds` and pauses longer, and when the last one ends. */
export function getBabbleTimes(options: {
  syllables: BabbleSyllable[];
  syllableSeconds: number;
}) {
  return options.syllables.reduce<{ startsAt: number[]; endsAt: number }>(
    (times, syllable) => ({
      startsAt: [...times.startsAt, times.endsAt],
      endsAt:
        times.endsAt +
        options.syllableSeconds *
          (syllable.kind === "voiced"
            ? 1
            : syllable.long
              ? LONG_PAUSE_SHARE
              : SHORT_PAUSE_SHARE),
    }),
    { startsAt: [], endsAt: 0 }
  );
}
