import type { CatSnapshot, RoomEvent } from "@/lib/paws/wire-types";

const LIFTED_HEIGHT = 1.5;
const PLANTED_HEIGHT = 0.5;
const HIND_LEG_START = 2;

/** Return a paw print event for every leg in `snapshots` that was lifted in `lastHeights` and is now planted, and update `lastHeights` to the current leg heights. */
export function detectPawLandings(options: {
  snapshots: CatSnapshot[];
  lastHeights: { [userId: string]: number[] | undefined };
}) {
  const landings: RoomEvent[] = [];
  for (const snapshot of options.snapshots) {
    const previous = options.lastHeights[snapshot.userId];
    snapshot.legs.forEach((leg, index) => {
      const wasLifted = (previous?.at(index) ?? 0) > LIFTED_HEIGHT;
      const isTucked = index >= HIND_LEG_START && snapshot.pose.sleep > 0.5;
      if (wasLifted && leg.h < PLANTED_HEIGHT && !isTucked) {
        landings.push({
          kind: "pawPrint",
          userId: snapshot.userId,
          x: leg.x,
          y: leg.y,
          angle: snapshot.heading,
          leg: index,
        });
      }
    });
    options.lastHeights[snapshot.userId] = snapshot.legs.map((leg) => leg.h);
  }
  return landings;
}
