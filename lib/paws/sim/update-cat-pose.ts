import { blendPose } from "./blend-pose";
import type { PoseName } from "./cat-poses";
import { catToWorld } from "./cat-to-world";
import { clamp } from "./clamp";
import { damp } from "./damp";
import { deriveCat } from "./derive-cat";
import { getCatFrame } from "./get-cat-frame";
import { isCatLeaving } from "./is-cat-leaving";
import { isCatOnstage } from "./is-cat-onstage";
import type { Point, SimCat, Tick } from "./sim-types";
import { toCatSnapshot } from "./to-cat-snapshot";
import { wrapAngle } from "./wrap-angle";

const RESTING_STATES = new Set(["sit", "sleep", "paw", "sniff", "bat"]);

/** Ease `cat` toward its resting or standing pose, turn its head toward what it is watching, and refresh its derived geometry. */
export function updateCatPose(options: { tick: Tick; cat: SimCat }) {
  const { tick, cat } = options;
  const { world, dtSeconds } = tick;
  if (!isCatOnstage(cat)) return;
  const target: PoseName =
    RESTING_STATES.has(cat.state) && cat.rest !== undefined
      ? cat.rest
      : "stand";
  const rate = target === "sleep" ? 1.1 : 1.8;
  const eased = {
    stand: damp({
      from: cat.weights.stand,
      to: target === "stand" ? 1 : 0,
      rate,
      dtSeconds,
    }),
    sit: damp({
      from: cat.weights.sit,
      to: target === "sit" ? 1 : 0,
      rate,
      dtSeconds,
    }),
    sleep: damp({
      from: cat.weights.sleep,
      to: target === "sleep" ? 1 : 0,
      rate,
      dtSeconds,
    }),
  };
  const sum = eased.stand + eased.sit + eased.sleep;
  cat.weights = {
    stand: eased.stand / sum,
    sit: eased.sit / sum,
    sleep: eased.sleep / sum,
  };
  cat.pose = blendPose(cat.weights);
  const isSniffing =
    cat.state === "sniff" ||
    (cat.social?.kind === "greet" && cat.social.sniffing);
  cat.sniff = damp({
    from: cat.sniff,
    to: isSniffing ? 1 : 0,
    rate: 2.4,
    dtSeconds,
  });

  const neck = cat.pose.spine[cat.pose.spine.length - 1];
  const [neckX, neckY] = catToWorld(getCatFrame(cat), [
    neck[0],
    neck[1] + ((cat.bend * neck[0] * neck[0]) / 4000) * cat.weights.stand,
  ]);
  const focus =
    cat.focusId === undefined ? undefined : world.fingers[cat.focusId];
  const partner =
    cat.partnerId === undefined ? undefined : world.cats[cat.partnerId];
  const watched = ((): Point | undefined => {
    if (focus?.present === true) return focus;
    if (partner === undefined || cat.social === undefined) return undefined;
    if (cat.social.kind === "bat") return partner.derived.tailTip;
    return { x: partner.derived.head[0], y: partner.derived.head[1] };
  })();
  const yawTarget =
    watched !== undefined && !isCatLeaving(cat)
      ? clamp(
          wrapAngle(
            Math.atan2(watched.y - neckY, watched.x - neckX) -
              cat.heading -
              cat.pose.headDir
          ),
          -1,
          1
        )
      : Math.sin(world.time * 0.6 + cat.derived.phase) * 0.15;
  cat.yaw = damp({
    from: cat.yaw,
    to: yawTarget * (1 - cat.weights.sleep),
    rate: 4,
    dtSeconds,
  });
  cat.derived = deriveCat({
    snapshot: toCatSnapshot(cat),
    look: cat.look,
    time: world.time,
  });
}
