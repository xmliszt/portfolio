"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { FirstVisit } from "./first-visit/first-visit";
import { FirstVisitKeyframes } from "./first-visit/first-visit-keyframes";
import { useArrivedFlag } from "./first-visit/use-arrived-flag";
import { LanguagePicker } from "./i18n/language-picker";
import { SoundToggle } from "./sound/sound-toggle";
import { LaundromatScene } from "./laundromat-scene";
import { ShareButton } from "./share-button";

const HEAD_HOME_FADE_MS = 700;

type Arrival = "hidden" | "arriving" | "arrived";

type LaundromatEntryProps = {
  config: SceneConfig;
  bedroom?: BedroomConfig;
  hourOverride?: number;
  ignoreArrivedFlag?: boolean;
};

export function LaundromatEntry(props: LaundromatEntryProps) {
  const bedroom = props.bedroom ?? bedroomConfig;
  const { walkIn } = bedroom.motion;
  const arrivedFlag = useArrivedFlag();
  const [isBackHome, setIsBackHome] = useState(false);
  const [hasCleanPile, setHasCleanPile] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasArrived =
    props.ignoreArrivedFlag || isBackHome ? false : arrivedFlag.hasArrived;
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

  function markArrived() {
    if (!props.ignoreArrivedFlag) arrivedFlag.markArrived();
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

  function handleHeadHome() {
    setIsLeaving(true);
    later(prefersReducedMotion ? 0 : HEAD_HOME_FADE_MS, () => {
      setIsLeaving(false);
      setIsBackHome(true);
      setHasCleanPile(true);
      setIsBedroomGone(false);
      setArrival("hidden");
    });
  }

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setArrival("arrived");
  }

  return (
    <div className="relative size-full">
      <FirstVisitKeyframes motion={bedroom.motion} />
      <div className="absolute top-6 right-7 z-10 flex items-center gap-x-2">
        <LanguagePicker />
        <SoundToggle />
        <ShareButton />
      </div>
      {isFirstVisit && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: isBackHome && !prefersReducedMotion ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: HEAD_HOME_FADE_MS / 1000, ease: "easeOut" }}
        >
          <FirstVisit
            scene={props.config}
            bedroom={bedroom}
            hourOverride={props.hourOverride}
            cleanPile={hasCleanPile}
            onWalkIn={handleWalkIn}
            onListen={handleListen}
          />
        </motion.div>
      )}
      <div
        ref={sceneRef}
        tabIndex={-1}
        data-lm-arrival={visibleArrival}
        className="absolute inset-0 outline-none data-[lm-arrival=hidden]:pointer-events-none data-[lm-arrival=hidden]:opacity-0"
        onAnimationEnd={handleAnimationEnd}
        style={
          isLeaving
            ? {
                opacity: 0,
                transition: `opacity ${HEAD_HOME_FADE_MS}ms ease-in`,
              }
            : undefined
        }
      >
        <LaundromatScene
          config={props.config}
          hourOverride={props.hourOverride}
          onHeadHome={handleHeadHome}
        />
      </div>
    </div>
  );
}
