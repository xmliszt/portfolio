import { catToWorld } from "./cat-to-world";
import { clamp } from "./clamp";
import { damp } from "./damp";
import { emitCatSound } from "./emit-cat-sound";
import { endSocial } from "./end-social";
import { faceToward } from "./face-toward";
import { FLEE_SPEED } from "./flee-speed";
import { getCatFrame } from "./get-cat-frame";
import { holdStill } from "./hold-still";
import { isCatLeaving } from "./is-cat-leaving";
import { isCatOnstage } from "./is-cat-onstage";
import { pickFarSpot } from "./pick-far-spot";
import { pickRandomSpot } from "./pick-random-spot";
import { releasePaws } from "./release-paws";
import { setCatState } from "./set-cat-state";
import type { Point, SimCat, SimFinger, Tick } from "./sim-types";
import { spawnCat } from "./spawn-cat";
import { startLeaving } from "./start-leaving";
import { startReach } from "./start-reach";
import { startSocial } from "./start-social";
import { startZoomies } from "./start-zoomies";
import { turnToward } from "./turn-toward";
import { walkTo } from "./walk-to";
import { worldToCat } from "./world-to-cat";

type FingerView = {
  x: number;
  y: number;
  present: boolean;
  pressed: boolean;
  speed: number;
  stillSeconds: number;
};

const NO_FINGER: FingerView = {
  x: 0,
  y: 0,
  present: false,
  pressed: false,
  speed: 0,
  stillSeconds: 0,
};
const CROWD_RANGE = 240;
const CROWD_SIZE = 3;
const SHY_STEP = 260;
const SHY_SECONDS = 6;
const PURR_RANGE = 160;
const ZOOMIES_CHANCE = 0.2;
const ZOOM_PACE = 6;

const approachGoal = (cat: SimCat, finger: FingerView): Point => {
  if (!finger.present) return cat.wander;
  const k = cat.build.scale;
  const gap = Math.hypot(cat.x - finger.x, cat.y - finger.y);
  if (gap < 150 * k) return { x: cat.x, y: cat.y };
  return {
    x: finger.x - ((finger.x - cat.x) / gap) * 140 * k,
    y: finger.y - ((finger.y - cat.y) / gap) * 140 * k,
  };
};

const frontLegOnSide = (cat: SimCat, localY: number) =>
  cat.legs.find((leg) => leg.front && leg.side === (localY < 0 ? -1 : 1)) ??
  cat.legs[0];

const isReachingFinger = (cat: SimCat, fingerId: string) =>
  cat.legs.some(
    (leg) =>
      leg.reach?.target.kind === "finger" &&
      leg.reach.target.userId === fingerId
  );

const reposition = (tick: Tick, cat: SimCat, point: Point) => {
  const k = cat.build.scale;
  const gap = Math.max(1, Math.hypot(point.x - cat.x, point.y - cat.y));
  if (cat.repositionDir === undefined || gap > 110 * k) {
    cat.repositionDir =
      gap < 80 * k
        ? [Math.cos(cat.heading), Math.sin(cat.heading)]
        : [(point.x - cat.x) / gap, (point.y - cat.y) / gap];
  }
  const goal = {
    x: point.x - cat.repositionDir[0] * 95 * k,
    y: point.y - cat.repositionDir[1] * 95 * k,
  };
  if (Math.hypot(cat.x - goal.x, cat.y - goal.y) > 14 * k)
    walkTo({ tick, cat, goal, pace: 0.7 });
  else faceToward({ tick, cat, point });
};

const updatePaw = (tick: Tick, cat: SimCat, finger: FingerView) => {
  const { world } = tick;
  const frame = getCatFrame(cat);
  const attachX = cat.pose.frontAttach[0][0];
  const held = cat.pawFingerIds
    .map((id) => world.fingers[id])
    .filter((candidate): candidate is SimFinger => candidate !== undefined);
  if (held.length === 2) {
    const mid = {
      x: (held[0].x + held[1].x) / 2,
      y: (held[0].y + held[1].y) / 2,
    };
    const locals = held.map((candidate) => ({
      finger: candidate,
      local: worldToCat(frame, candidate),
    }));
    const isInReach = locals.every(
      ({ local }) =>
        local[0] > attachX &&
        local[0] < attachX + 170 &&
        Math.abs(local[1]) < 130
    );
    if (isInReach) {
      cat.repositionDir = undefined;
      const turn = faceToward({ tick, cat, point: mid });
      const isReaching = cat.legs.some((leg) => leg.reach !== undefined);
      if (!isReaching && turn > 0.5) return;
      cat.rest = "sit";
      const [left, right] = locals.toSorted((a, b) => a.local[1] - b.local[1]);
      for (const [leg, target] of [
        [frontLegOnSide(cat, -1), left.finger],
        [frontLegOnSide(cat, 1), right.finger],
      ] as const) {
        const isOnIt =
          leg.reach?.target.kind === "finger" &&
          leg.reach.target.userId === target.userId;
        if (!isOnIt) {
          startReach({
            world,
            leg,
            phase: "extend",
            durationSeconds: 0.34,
            lift: 12,
            target: { kind: "finger", userId: target.userId },
          });
        }
      }
      return;
    }
    releasePaws(cat);
    cat.rest = undefined;
    reposition(tick, cat, mid);
    return;
  }
  const fingerId = cat.pawFingerIds[0];
  const [localX, localY] = worldToCat(frame, finger);
  const isGood =
    localX > attachX + 18 && localX < attachX + 120 && Math.abs(localY) < 42;
  const isKept =
    localX > attachX + 6 && localX < attachX + 135 && Math.abs(localY) < 58;
  const isReaching = fingerId !== undefined && isReachingFinger(cat, fingerId);
  if (fingerId !== undefined && (isReaching ? isKept : isGood)) {
    cat.repositionDir = undefined;
    holdStill({ tick, cat });
    if (!isReaching) {
      startReach({
        world,
        leg: frontLegOnSide(cat, localY),
        phase: "extend",
        durationSeconds: 0.34,
        lift: 12,
        target: { kind: "finger", userId: fingerId },
      });
    }
    return;
  }
  releasePaws(cat);
  cat.rest = undefined;
  reposition(tick, cat, finger);
};

/** Decide what `cat` does this step, from its state, the finger it is curious about, and the cats around it. */
export function updateBrain(options: { tick: Tick; cat: SimCat }) {
  const { tick, cat } = options;
  const { world, dtSeconds } = tick;
  const k = cat.build.scale;
  cat.stateT += dtSeconds;
  cat.sniffCooldownSeconds -= dtSeconds;
  if (cat.state === "offstage") {
    cat.speedTarget = 0;
    if (!cat.isDeparting && cat.stateT > cat.waitSeconds)
      spawnCat({ world, cat });
    return;
  }
  if (cat.isDeparting && !isCatLeaving(cat)) {
    startLeaving({ world, cat });
    return;
  }

  const focus =
    cat.focusId === undefined ? undefined : world.fingers[cat.focusId];
  const finger: FingerView =
    focus?.present === true
      ? { ...focus, pressed: focus.pressed && cat.pawFingerIds.length > 0 }
      : NO_FINGER;
  const fingerGap = finger.present
    ? Math.hypot(cat.x - finger.x, cat.y - finger.y)
    : Infinity;
  const head = { x: cat.derived.head[0], y: cat.derived.head[1] };
  if (focus?.present === true) {
    const headGap = Math.hypot(focus.x - head.x, focus.y - head.y);
    cat.approachSpeed = damp({
      from: cat.approachSpeed,
      to: (cat.previousHeadGap - headGap) / Math.max(dtSeconds, 0.001),
      rate: 6,
      dtSeconds,
    });
    cat.previousHeadGap = headGap;
  }

  const scare = Object.values(world.fingers).find(
    (candidate) =>
      candidate.present &&
      candidate.speed > FLEE_SPEED &&
      Math.hypot(cat.x - candidate.x, cat.y - candidate.y) < 260 * k
  );
  if (scare !== undefined && cat.state !== "flee") {
    startLeaving({ world, cat, fleeFrom: scare });
    return;
  }

  const crowd = Object.values(world.fingers).filter(
    (candidate) =>
      candidate.present &&
      Math.hypot(cat.x - candidate.x, cat.y - candidate.y) < CROWD_RANGE * k
  );
  if (
    crowd.length >= CROWD_SIZE &&
    world.time >= cat.curiousCooldownUntil &&
    !isCatLeaving(cat) &&
    cat.state !== "sleep"
  ) {
    const centre = {
      x: crowd.reduce((sum, candidate) => sum + candidate.x, 0) / crowd.length,
      y: crowd.reduce((sum, candidate) => sum + candidate.y, 0) / crowd.length,
    };
    const gap = Math.max(1, Math.hypot(cat.x - centre.x, cat.y - centre.y));
    releasePaws(cat);
    cat.pawFingerIds = [];
    cat.focusId = undefined;
    cat.rest = undefined;
    cat.curiousCooldownUntil = world.time + SHY_SECONDS;
    cat.wander = {
      x: clamp(
        cat.x + ((cat.x - centre.x) / gap) * SHY_STEP * k,
        world.width * 0.08,
        world.width * 0.92
      ),
      y: clamp(
        cat.y + ((cat.y - centre.y) / gap) * SHY_STEP * k,
        world.height * 0.1,
        world.height * 0.9
      ),
    };
    setCatState(cat, "approach");
    return;
  }
  const partner =
    cat.partnerId === undefined ? undefined : world.cats[cat.partnerId];
  if (
    cat.social !== undefined &&
    (partner === undefined ||
      !isCatOnstage(partner) ||
      isCatLeaving(partner) ||
      (cat.social.kind !== "bat" && partner.partnerId !== cat.userId))
  ) {
    endSocial({ world, cat });
    return;
  }

  switch (cat.state) {
    case "enter":
    case "approach": {
      cat.rest = undefined;
      const goal = approachGoal(cat, finger);
      const ignoreId = cat.isSnuggling ? cat.partnerId : undefined;
      if (walkTo({ tick, cat, goal, pace: 1, ignoreId }) < 18 * k) {
        if (cat.isSnuggling) {
          cat.isSnuggling = false;
          cat.partnerId = undefined;
          cat.rest = "sit";
          setCatState(cat, "sit");
          break;
        }
        cat.pauseSeconds = 2 + world.random() * 4;
        setCatState(cat, "pause");
      }
      if (cat.state === "approach" && finger.pressed) setCatState(cat, "paw");
      if (
        !finger.present &&
        !cat.isSnuggling &&
        world.time > cat.socialCooldownUntil &&
        world.random() < dtSeconds * 0.2
      ) {
        startSocial({ tick, cat, range: 520 * k });
      }
      break;
    }
    case "pause": {
      cat.rest = undefined;
      if (finger.present) turnToward({ tick, cat, point: finger });
      else holdStill({ tick, cat });
      if (finger.pressed) {
        setCatState(cat, "paw");
        break;
      }
      const wantsSniff =
        finger.present &&
        Math.hypot(finger.x - head.x, finger.y - head.y) < 210 * k &&
        cat.sniffCooldownSeconds <= 0 &&
        cat.approachSpeed > 28 * k &&
        finger.speed < 350;
      if (wantsSniff) {
        setCatState(cat, "sniff");
        break;
      }
      if (finger.present) {
        const goal = approachGoal(cat, finger);
        if (Math.hypot(goal.x - cat.x, goal.y - cat.y) > 100 * k) {
          setCatState(cat, "approach");
          break;
        }
        if (finger.stillSeconds > 1.8 && cat.stateT > 1)
          setCatState(cat, "settle");
      } else if (cat.stateT > cat.pauseSeconds) {
        if (
          world.time > cat.zoomiesCooldownUntil &&
          world.random() < ZOOMIES_CHANCE
        ) {
          startZoomies({ world, cat });
          break;
        }
        if (
          world.time > cat.socialCooldownUntil &&
          world.random() < 0.6 &&
          startSocial({ tick, cat, range: 1040 * k })
        )
          break;
        if (world.random() < 0.5) {
          cat.wander = pickRandomSpot({ world, cat });
          setCatState(cat, "approach");
        } else {
          setCatState(cat, "settle");
        }
      }
      break;
    }
    case "settle": {
      if (finger.pressed) {
        setCatState(cat, "paw");
        break;
      }
      if (!finger.present) {
        holdStill({ tick, cat });
        if (cat.stateT > 0.5) {
          cat.rest = "sit";
          setCatState(cat, "sit");
        }
        break;
      }
      if (finger.stillSeconds < 0.1 && finger.speed > 200) {
        setCatState(cat, "pause");
        break;
      }
      const gap = Math.max(1, fingerGap);
      const goal = {
        x: finger.x - ((finger.x - cat.x) / gap) * 70 * k,
        y: finger.y - ((finger.y - cat.y) / gap) * 70 * k,
      };
      if (
        walkTo({ tick, cat, goal, pace: 0.45 }) < 14 * k ||
        fingerGap < 70 * k
      ) {
        cat.rest = "sit";
        setCatState(cat, "sit");
      }
      break;
    }
    case "sit": {
      holdStill({ tick, cat });
      purrNearFinger(tick, cat);
      if (finger.pressed) {
        setCatState(cat, "paw");
        break;
      }
      if (finger.present && finger.stillSeconds > 0.6) {
        const [frontX, frontY] = catToWorld(getCatFrame(cat), [84, 0]);
        if (Math.hypot(frontX - finger.x, frontY - finger.y) > 170 * k) {
          cat.rest = undefined;
          setCatState(cat, "pause");
          break;
        }
      }
      if (
        !finger.present &&
        cat.stateT > 8 &&
        world.random() < dtSeconds * 0.05
      ) {
        cat.rest = undefined;
        cat.wander = pickRandomSpot({ world, cat });
        setCatState(cat, "approach");
        break;
      }
      if (cat.stateT > 25 && (!finger.present || finger.stillSeconds > 10)) {
        cat.rest = "sleep";
        setCatState(cat, "sleep");
      }
      break;
    }
    case "sleep": {
      holdStill({ tick, cat });
      purrNearFinger(tick, cat);
      if (finger.pressed) {
        cat.rest = "sit";
        setCatState(cat, "sit");
        break;
      }
      if (
        !finger.present &&
        cat.stateT > 30 &&
        world.random() < dtSeconds * 0.04
      ) {
        cat.rest = undefined;
        cat.wander = pickRandomSpot({ world, cat });
        setCatState(cat, "approach");
      }
      break;
    }
    case "sniff": {
      holdStill({ tick, cat });
      if (!cat.hasNosed && cat.derived.headH - 4 < 0.6) {
        cat.hasNosed = true;
        tick.events.push({
          kind: "nosePrint",
          userId: cat.userId,
          x: cat.derived.nose.x,
          y: cat.derived.nose.y,
          angle: cat.derived.headDir,
        });
      }
      if (cat.stateT > 2.2) {
        cat.sniffCooldownSeconds = 5;
        setCatState(cat, cat.rest ?? "pause");
      }
      break;
    }
    case "paw": {
      if (!finger.pressed) {
        releasePaws(cat);
        cat.repositionDir = undefined;
        setCatState(cat, cat.rest ?? "pause");
        break;
      }
      updatePaw(tick, cat, finger);
      break;
    }
    case "greet": {
      if (partner === undefined || cat.social?.kind !== "greet") {
        endSocial({ world, cat });
        break;
      }
      const social = cat.social;
      social.t += dtSeconds;
      const meet = 112 * (k + partner.build.scale);
      const gap = Math.max(1, Math.hypot(cat.x - partner.x, cat.y - partner.y));
      if (gap > meet + 6 * k && !social.sniffing) {
        const goal = {
          x: partner.x - ((partner.x - cat.x) / gap) * meet,
          y: partner.y - ((partner.y - cat.y) / gap) * meet,
        };
        walkTo({ tick, cat, goal, pace: 0.55, ignoreId: partner.userId });
      } else if (faceToward({ tick, cat, point: partner }) < 0.45) {
        social.sniffing = true;
      }
      if (social.sniffing) social.sniffT += dtSeconds;
      if (
        social.lead &&
        !social.printed &&
        cat.derived.headH < 5 &&
        partner.derived.headH < 5
      ) {
        social.printed = true;
        tick.events.push({
          kind: "nosePrint",
          userId: cat.userId,
          x: (cat.derived.nose.x + partner.derived.nose.x) / 2,
          y: (cat.derived.nose.y + partner.derived.nose.y) / 2,
          angle: cat.derived.headDir,
        });
      }
      if (social.sniffT > 2.4 || social.t > 10) {
        cat.wander = pickRandomSpot({ world, cat });
        endSocial({ world, cat });
      }
      break;
    }
    case "chase": {
      if (partner === undefined || cat.social?.kind !== "chase") {
        endSocial({ world, cat });
        break;
      }
      const social = cat.social;
      social.t += dtSeconds;
      walkTo({ tick, cat, goal: partner, pace: 2.3, ignoreId: partner.userId });
      if (
        Math.hypot(cat.x - partner.x, cat.y - partner.y) <
          80 * (k + partner.build.scale) ||
        social.t > social.durationSeconds
      ) {
        endSocial({ world, cat });
      }
      break;
    }
    case "chased": {
      if (partner === undefined) {
        endSocial({ world, cat });
        break;
      }
      const gap = Math.max(1, Math.hypot(cat.x - partner.x, cat.y - partner.y));
      const goal = {
        x: clamp(
          cat.x + ((cat.x - partner.x) / gap) * 400 * k,
          world.width * 0.08,
          world.width * 0.92
        ),
        y: clamp(
          cat.y + ((cat.y - partner.y) / gap) * 400 * k,
          world.height * 0.1,
          world.height * 0.9
        ),
      };
      walkTo({ tick, cat, goal, pace: 2.1, ignoreId: partner.userId });
      break;
    }
    case "bat": {
      if (partner === undefined || cat.social?.kind !== "bat") {
        endSocial({ world, cat });
        break;
      }
      const social = cat.social;
      social.t += dtSeconds;
      if (!(partner.state === "sit" || partner.state === "sleep")) {
        endSocial({ world, cat });
        break;
      }
      const tip = partner.derived.tailTip;
      if (social.phase === "go") {
        const gap = Math.max(1, Math.hypot(cat.x - tip.x, cat.y - tip.y));
        const goal = {
          x: tip.x - ((tip.x - cat.x) / gap) * 90 * k,
          y: tip.y - ((tip.y - cat.y) / gap) * 90 * k,
        };
        if (Math.hypot(cat.x - goal.x, cat.y - goal.y) > 12 * k) {
          walkTo({ tick, cat, goal, pace: 0.6, ignoreId: partner.userId });
        } else if (faceToward({ tick, cat, point: tip }) < 0.35) {
          social.phase = "play";
          social.t = 0;
          cat.rest = "sit";
        }
        if (social.t > 12) endSocial({ world, cat });
        break;
      }
      holdStill({ tick, cat });
      if (
        !cat.legs.some((leg) => leg.reach !== undefined) &&
        cat.weights.sit > 0.6
      ) {
        const [, localY] = worldToCat(getCatFrame(cat), tip);
        startReach({
          world,
          leg: frontLegOnSide(cat, localY),
          phase: "extend",
          durationSeconds: 0.3,
          lift: 10,
          target: { kind: "tail", catId: partner.userId },
        });
      }
      if (social.t > social.durationSeconds) {
        cat.wander = pickRandomSpot({ world, cat });
        endSocial({ world, cat });
      }
      break;
    }
    case "zoom": {
      const isThere =
        walkTo({ tick, cat, goal: cat.wander, pace: ZOOM_PACE }) < 60 * k;
      if (isThere) {
        cat.zoomDashes -= 1;
        cat.wander = pickFarSpot({ world, cat });
      }
      if (cat.zoomDashes <= 0 || cat.stateT > 10) {
        cat.pauseSeconds = 1.5 + world.random() * 2;
        setCatState(cat, "pause");
      }
      break;
    }
    case "leave":
    case "flee": {
      walkTo({
        tick,
        cat,
        goal: cat.exit,
        pace: cat.state === "flee" ? 3.4 : 1,
      });
      const margin = 260 * k;
      if (
        cat.x < -margin ||
        cat.x > world.width + margin ||
        cat.y < -margin ||
        cat.y > world.height + margin
      ) {
        cat.waitSeconds = 4 + world.random() * 8;
        setCatState(cat, "offstage");
      }
      break;
    }
    default: {
      const unknown: never = cat.state;
      return unknown;
    }
  }
}

function purrNearFinger(tick: Tick, cat: SimCat) {
  const head = cat.derived.head;
  const isNear = Object.values(tick.world.fingers).some(
    (finger) =>
      finger.present &&
      Math.hypot(finger.x - head[0], finger.y - head[1]) < PURR_RANGE
  );
  if (isNear && tick.world.random() < tick.dtSeconds * 0.12)
    emitCatSound({ tick, cat, sound: "purr" });
}
