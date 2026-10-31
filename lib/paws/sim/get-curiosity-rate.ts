const NOTICE_RANGE = 520;
const OWNER_PULL = 2.5;

/** Return the chance per second that a cat with `curiosity` (0–1) becomes curious about a finger `distance` away; higher for a finger held still, for its owner's finger, and lower while asleep. */
export function getCuriosityRate(options: {
  curiosity: number;
  distance: number;
  stillSeconds: number;
  isOwner: boolean;
  isAsleep: boolean;
}) {
  if (options.distance > NOTICE_RANGE) return 0;
  return (
    options.curiosity *
    (options.stillSeconds > 0.5 ? 0.45 : 0.12) *
    (1 - options.distance / 620) *
    (options.isAsleep ? 0.3 : 1) *
    (options.isOwner ? OWNER_PULL : 1)
  );
}
