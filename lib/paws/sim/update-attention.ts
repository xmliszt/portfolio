import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import { endCuriosity } from "./end-curiosity";
import { findSharedFingers } from "./find-shared-fingers";
import { getCuriosityRate } from "./get-curiosity-rate";
import { isCatLeaving } from "./is-cat-leaving";
import { isCatOnstage } from "./is-cat-onstage";
import { makeCurious } from "./make-curious";
import type { SimCat, Tick } from "./sim-types";

const PAW_RANGE = 220;
const FORGET_ABSENT_SECONDS = 3;

const dropFinger = (cat: SimCat, fingerId: string) => {
  cat.pawFingerIds = cat.pawFingerIds.filter((id) => id !== fingerId);
  for (const leg of cat.legs) {
    if (
      leg.reach?.target.kind === "finger" &&
      leg.reach.target.userId === fingerId
    )
      leg.reach = undefined;
  }
};

/** Decide which cats are curious about which finger, and which cat puts its paws on each pressed finger. */
export function updateAttention(tick: Tick) {
  const { world, dtSeconds } = tick;
  const cats = Object.values(world.cats);
  const fingers = Object.values(world.fingers);
  const isAvailable = (cat: SimCat) => isCatOnstage(cat) && !isCatLeaving(cat);

  for (const cat of cats) {
    for (const fingerId of cat.pawFingerIds) {
      const finger = world.fingers[fingerId];
      if (
        !isAvailable(cat) ||
        finger === undefined ||
        !finger.present ||
        !finger.pressed
      )
        dropFinger(cat, fingerId);
    }
    const heldId = cat.pawFingerIds.at(0);
    if (heldId !== undefined && !cat.pawFingerIds.includes(cat.focusId ?? ""))
      cat.focusId = heldId;
  }

  for (const cat of cats.filter(
    (candidate) => isAvailable(candidate) && candidate.pawFingerIds.length < 2
  )) {
    const shared = findSharedFingers({ cat, fingers });
    if (shared === undefined) continue;
    const holders = cats.filter(
      (other) =>
        other !== cat &&
        shared.some((finger) => other.pawFingerIds.includes(finger.userId))
    );
    if (holders.some((holder) => holder.pawFingerIds.length > 1)) continue;
    for (const holder of holders)
      for (const finger of shared) dropFinger(holder, finger.userId);
    if (cat.focusId !== shared[0].userId)
      makeCurious({ world, cat, fingerId: shared[0].userId });
    cat.pawFingerIds = shared.map((finger) => finger.userId);
  }

  for (const finger of fingers.filter(
    (candidate) => candidate.present && candidate.pressed
  )) {
    if (cats.some((cat) => cat.pawFingerIds.includes(finger.userId))) continue;
    const gapTo = (cat: SimCat) =>
      Math.hypot(cat.x - finger.x, cat.y - finger.y);
    const best = cats
      .filter(
        (cat) =>
          isAvailable(cat) &&
          cat.pawFingerIds.length === 0 &&
          (cat.focusId !== undefined || gapTo(cat) < PAW_RANGE)
      )
      .toSorted((a, b) => gapTo(a) - gapTo(b))
      .at(0);
    if (best === undefined) continue;
    if (best.focusId !== finger.userId)
      makeCurious({ world, cat: best, fingerId: finger.userId });
    best.pawFingerIds = [finger.userId];
  }

  for (const cat of cats.filter(
    (candidate) => candidate.focusId !== undefined
  )) {
    const focus =
      cat.focusId === undefined ? undefined : world.fingers[cat.focusId];
    const isBored =
      world.time > cat.curiousUntil && cat.pawFingerIds.length === 0;
    if (!isAvailable(cat)) {
      cat.focusId = undefined;
      cat.pawFingerIds = [];
    } else if (
      isBored ||
      focus === undefined ||
      focus.absentSeconds > FORGET_ABSENT_SECONDS
    ) {
      endCuriosity({ world, cat });
    }
  }

  const curiousCount = cats.filter((cat) => cat.focusId !== undefined).length;
  cats
    .filter(
      (cat) =>
        isAvailable(cat) &&
        cat.focusId === undefined &&
        cat.social === undefined &&
        world.time >= cat.curiousCooldownUntil
    )
    .reduce((count, cat) => {
      if (count >= ROOM_LIMITS.maxCuriousCats) return count;
      const noticed = fingers.find(
        (finger) =>
          finger.present &&
          world.random() <
            getCuriosityRate({
              curiosity: cat.curiosity,
              distance: Math.hypot(cat.x - finger.x, cat.y - finger.y),
              stillSeconds: finger.stillSeconds,
              isOwner: finger.userId === cat.userId,
              isAsleep: cat.state === "sleep",
            }) *
              dtSeconds
      );
      if (noticed === undefined) return count;
      makeCurious({ world, cat, fingerId: noticed.userId });
      return count + 1;
    }, curiousCount);
}
