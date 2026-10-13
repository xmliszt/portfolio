import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { animate, useMotionValue } from "motion/react";

import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { getCurtainLayout } from "@/lib/laundromat/first-visit/get-curtain-layout";
import { stepCurtainHem } from "@/lib/laundromat/first-visit/step-curtain-hem";
import { stepCurtainRings } from "@/lib/laundromat/first-visit/step-curtain-rings";

const PULL_EASE = [0.45, 0.05, 0.3, 1] as const;
const MAX_STEP_S = 1 / 30;
const SETTLED_DISTANCE = 1e-4;
const SETTLED_SPEED = 1e-3;

export type CurtainPose = { rings: number[]; hem: number[] };

type CurtainLayout = ReturnType<typeof getCurtainLayout>;

/** Return a motion value holding each ring's and each hem fold's distance from the stacked ring, animated by a hand pull whenever `open` changes. */
export function useCurtainPose(options: {
  open: boolean;
  layout: CurtainLayout;
  rings: number;
  motion: BedroomConfig["motion"]["curtain"];
  reducedMotion: boolean;
}): MotionValue<CurtainPose> {
  const { openLeader, closedLeader, minGap, maxGap } = options.layout;
  const { pullMs, hemPeriodMs, hemDampingRatio } = options.motion;
  const stacked = Array.from(
    { length: options.rings },
    (_, index) => index * minGap
  );
  const { open, reducedMotion } = options;
  const startLeader = open ? openLeader : closedLeader;
  const startRings = stepCurtainRings({
    rings: stacked,
    leader: startLeader,
    minGap,
    maxGap,
  });
  const pose = useMotionValue<CurtainPose>({
    rings: startRings,
    hem: startRings,
  });
  const leader = useMotionValue(startLeader);
  const velocityRef = useRef(stacked.map(() => 0));

  useEffect(() => {
    const target = open ? openLeader : closedLeader;
    if (reducedMotion) {
      leader.jump(target);
      const rings = stepCurtainRings({
        rings: pose.get().rings,
        leader: target,
        minGap,
        maxGap,
      });
      velocityRef.current = rings.map(() => 0);
      pose.set({ rings, hem: rings });
      return;
    }
    const omega = (2 * Math.PI * 1000) / hemPeriodMs;
    let isPulled = false;
    const pull = animate(leader, target, {
      duration: pullMs / 1000,
      ease: PULL_EASE,
      onComplete: () => {
        isPulled = true;
      },
    });
    let frame = 0;
    let last = performance.now();
    function tick(now: number) {
      const dtS = Math.min((now - last) / 1000, MAX_STEP_S);
      last = now;
      const rings = stepCurtainRings({
        rings: pose.get().rings,
        leader: leader.get(),
        minGap,
        maxGap,
      });
      const hem = stepCurtainHem({
        hem: pose.get().hem,
        velocity: velocityRef.current,
        rings,
        dtS,
        omega,
        dampingRatio: hemDampingRatio,
      });
      const isSettled =
        isPulled &&
        hem.hem.every(
          (fold, index) => Math.abs(fold - rings[index]!) < SETTLED_DISTANCE
        ) &&
        hem.velocity.every((speed) => Math.abs(speed) < SETTLED_SPEED);
      if (isSettled) {
        velocityRef.current = rings.map(() => 0);
        pose.set({ rings, hem: rings });
        return;
      }
      velocityRef.current = hem.velocity;
      pose.set({ rings, hem: hem.hem });
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      pull.stop();
      cancelAnimationFrame(frame);
    };
  }, [
    open,
    reducedMotion,
    openLeader,
    closedLeader,
    minGap,
    maxGap,
    pullMs,
    hemPeriodMs,
    hemDampingRatio,
    leader,
    pose,
  ]);

  return pose;
}
