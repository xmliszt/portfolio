"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { FirstVisit } from "./first-visit/first-visit";
import { FirstVisitKeyframes } from "./first-visit/first-visit-keyframes";
import { useArrivedFlag } from "./first-visit/use-arrived-flag";
import { LaundromatScene } from "./laundromat-scene";

type Arrival = "hidden" | "arriving" | "arrived";

type LaundromatEntryProps = {
  config: SceneConfig;
};

export function LaundromatEntry(props: LaundromatEntryProps) {
  const { walkIn } = bedroomConfig.motion;
  const { hasArrived, markArrived } = useArrivedFlag();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [arrival, setArrival] = useState<Arrival>("hidden");
  const [isBedroomGone, setIsBedroomGone] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const visibleArrival = hasArrived === true ? "arrived" : arrival;
  const isFirstVisit = hasArrived === false && !isBedroomGone;

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (scene === null) return;
    scene.inert = visibleArrival === "hidden";
  }, [visibleArrival]);

  function later(delayMs: number, run: () => void) {
    timersRef.current.push(window.setTimeout(run, delayMs));
  }

  function leaveBedroom() {
    setIsBedroomGone(true);
    const active = document.activeElement;
    if (active === null || active === document.body) {
      sceneRef.current?.focus({ preventScroll: true });
    }
  }

  function handleWalkIn() {
    markArrived();
    if (prefersReducedMotion) {
      setArrival("arriving");
      later(walkIn.reducedFadeMs, leaveBedroom);
      return;
    }
    later(walkIn.arriveStartMs, () => setArrival("arriving"));
    later(walkIn.bedroomGoneMs, leaveBedroom);
  }

  function handleListen() {
    markArrived();
    setArrival("arriving");
    leaveBedroom();
  }

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setArrival("arrived");
  }

  return (
    <div className="relative size-full">
      <FirstVisitKeyframes motion={bedroomConfig.motion} />
      {isFirstVisit && (
        <FirstVisit
          scene={props.config}
          bedroom={bedroomConfig}
          onWalkIn={handleWalkIn}
          onListen={handleListen}
        />
      )}
      <div
        ref={sceneRef}
        tabIndex={-1}
        data-lm-arrival={visibleArrival}
        className="absolute inset-0 outline-none data-[lm-arrival=hidden]:pointer-events-none data-[lm-arrival=hidden]:opacity-0"
        onAnimationEnd={handleAnimationEnd}
      >
        <LaundromatScene config={props.config} />
      </div>
    </div>
  );
}
