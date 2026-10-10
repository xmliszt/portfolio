import type { GarmentKind } from "./bedroom-config";

/** Return the garment to nudge on nudge number `count`: one still on the floor that is not `last`, or `undefined` when none is left. */
export function pickNudgeGarment(options: {
  kinds: GarmentKind[];
  unavailable: GarmentKind[];
  last: GarmentKind | undefined;
  count: number;
}) {
  const candidates = options.kinds.filter(
    (kind) => kind !== options.last && !options.unavailable.includes(kind)
  );
  if (candidates.length === 0) return undefined;
  return candidates[(options.count * 2 + 1) % candidates.length];
}
