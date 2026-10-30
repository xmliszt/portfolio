import { catToWorld } from "./cat-to-world";
import { clamp } from "./clamp";
import { damp } from "./damp";
import { getCatFrame } from "./get-cat-frame";
import { isCatOnstage } from "./is-cat-onstage";
import { lerp } from "./lerp";
import type { SimCat, SimLeg, Tick } from "./sim-types";
import { updateReach } from "./update-reach";

const PRINT_MARGIN = 20;

const canStep = (cat: SimCat, leg: SimLeg, maxSwinging: number) => {
  const busy = cat.legs.filter(
    (other) => other.swing !== undefined || other.reach !== undefined
  );
  if (busy.length >= maxSwinging) return false;
  return !busy.some(
    (other) => other.front === leg.front || other.side === leg.side
  );
};

/** Step `cat`'s paws: plant them, swing the one that lags furthest behind the body, glide them while it shifts in place, and report each footfall as a paw print. */
export function updateCatLegs(options: { tick: Tick; cat: SimCat }) {
  const { tick, cat } = options;
  const { world, dtSeconds } = tick;
  if (!isCatOnstage(cat)) return;
  const k = cat.build.scale;
  const frame = getCatFrame(cat);
  const velocityX = Math.cos(cat.heading) * cat.speed;
  const velocityY = Math.sin(cat.heading) * cat.speed;
  const localSpeed = cat.speed / k;
  const isMoving = localSpeed > 8;
  const swingSeconds = clamp(0.3 - localSpeed * 0.0006, 0.13, 0.3);
  const lead = swingSeconds * 0.6;
  const isGliding =
    localSpeed < 15 && (cat.rest !== undefined || cat.weights.stand < 0.95);
  for (const leg of cat.legs) {
    const offset = (leg.front ? cat.pose.front : cat.pose.hind)[
      leg.side < 0 ? 0 : 1
    ];
    const [restX, restY] = catToWorld(frame, offset);
    leg.idealX = restX + velocityX * lead;
    leg.idealY = restY + velocityY * lead;
    leg.gap = Math.hypot(leg.x - leg.idealX, leg.y - leg.idealY);
  }
  const threshold = isMoving ? (18 + localSpeed * 0.12) * k : 4 * k;
  if (!isGliding) {
    for (const leg of cat.legs.toSorted((a, b) => b.gap - a.gap)) {
      if (leg.reach !== undefined || leg.swing !== undefined) continue;
      if (leg.gap > threshold && canStep(cat, leg, isMoving ? 2 : 1)) {
        leg.swing = {
          fromX: leg.x,
          fromY: leg.y,
          fromH: leg.h,
          t: 0,
          durationSeconds: swingSeconds,
          lift: 10 + localSpeed * 0.03,
        };
      }
    }
  }
  cat.legs.forEach((leg, legIndex) => {
    if (leg.reach !== undefined) {
      updateReach({ tick, cat, leg, legIndex, reach: leg.reach });
      return;
    }
    if (isGliding) {
      leg.swing = undefined;
      leg.x = damp({ from: leg.x, to: leg.idealX, rate: 3.2, dtSeconds });
      leg.y = damp({ from: leg.y, to: leg.idealY, rate: 3.2, dtSeconds });
      leg.h = damp({
        from: leg.h,
        to: Math.min(10, (leg.gap / k) * 0.25),
        rate: 10,
        dtSeconds,
      });
      return;
    }
    const swing = leg.swing;
    if (swing === undefined) {
      leg.h = damp({ from: leg.h, to: 0, rate: 14, dtSeconds });
      return;
    }
    swing.t += dtSeconds;
    const progress = Math.min(1, swing.t / swing.durationSeconds);
    const eased = progress * progress * (3 - 2 * progress);
    leg.x = lerp(swing.fromX, leg.idealX, eased);
    leg.y = lerp(swing.fromY, leg.idealY, eased);
    leg.h =
      lerp(swing.fromH, 0, progress) +
      Math.sin(Math.PI * progress) * swing.lift;
    if (progress < 1) return;
    leg.h = 0;
    leg.swing = undefined;
    const isOnGlass =
      leg.x > -PRINT_MARGIN &&
      leg.x < world.width + PRINT_MARGIN &&
      leg.y > -PRINT_MARGIN &&
      leg.y < world.height + PRINT_MARGIN;
    if (isOnGlass && cat.pose.padVis[leg.front ? 0 : 1] > 0.5) {
      tick.events.push({
        kind: "pawPrint",
        userId: cat.userId,
        x: leg.x,
        y: leg.y,
        angle: cat.heading,
        leg: legIndex,
      });
    }
  });
}
