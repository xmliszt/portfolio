"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { Homecoming } from "@/lib/laundromat/laundry/get-homecoming";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { FirstVisit } from "./first-visit/first-visit";
import { FirstVisitKeyframes } from "./first-visit/first-visit-keyframes";
import { useArrivedFlag } from "./first-visit/use-arrived-flag";
import { LanguagePicker } from "./i18n/language-picker";
import { InstantCamera } from "./instant-camera/instant-camera";
import { SettingsButton } from "./settings/settings-button";
import { SoundToggle } from "./sound/sound-toggle";
import { useWeatherSounds } from "./sound/use-weather-sounds";
import { ThemeButton } from "./themes/theme-button";
import { PocketButton } from "./tip/pocket-button";
import { TipProvider } from "./tip/tip-provider";
import { CameraButton } from "./camera-button";
import { LaundromatScene } from "./laundromat-scene";
import { PawsLink } from "./paws-link";
import { PortfolioLink } from "./portfolio-link";
import { UpdateNotice } from "./update-notice";

const HEAD_HOME_DIM_MS = 700;
const HEAD_HOME_REVEAL_MS = 1400;
const LIGHT_FILL_MS = 300;

type Arrival = "hidden" | "arriving" | "arrived";

type HomeVeil = "dimming" | "revealing";

type LaundromatEntryProps = {
  config: SceneConfig;
  bedroom?: BedroomConfig;
  hourOverride?: number;
  ignoreArrivedFlag?: boolean;
};

export function LaundromatEntry(props: LaundromatEntryProps) {
  useWeatherSounds();
  const bedroom = props.bedroom ?? bedroomConfig;
  const { walkIn } = bedroom.motion;
  const arrivedFlag = useArrivedFlag();
  const [isBackHome, setIsBackHome] = useState(false);
  const [home, setHome] = useState<Homecoming>({ kind: "fresh" });
  const [hasCleanPile, setHasCleanPile] = useState(false);
  const [lampSwitch, setLampSwitch] = useState<boolean>();
  const [isCurtainOpen, setIsCurtainOpen] = useState(true);
  const [homeVeil, setHomeVeil] = useState<HomeVeil>();
  const [isCameraOut, setIsCameraOut] = useState(false);
  const hasArrived =
    props.ignoreArrivedFlag || isBackHome ? false : arrivedFlag.hasArrived;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [arrival, setArrival] = useState<Arrival>("hidden");
  const [isBedroomGone, setIsBedroomGone] = useState(false);
  const [isDoorLit, setIsDoorLit] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const bedroomRef = useRef<HTMLDivElement>(null);
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
    scene.inert = visibleArrival === "hidden" || isCameraOut;
  }, [visibleArrival, isCameraOut]);

  useEffect(() => {
    const bedroom = bedroomRef.current;
    if (bedroom === null) return;
    bedroom.inert = isCameraOut;
    return () => {
      bedroom.inert = false;
    };
  }, [isCameraOut, isFirstVisit]);

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

  const lightCoverMs = walkIn.pushStartMs + walkIn.lightInMs;
  const lightOutStartMs = lightCoverMs + walkIn.whiteMs;

  function handleWalkIn() {
    markArrived();
    if (prefersReducedMotion) {
      setArrival("arriving");
      later(walkIn.reducedFadeMs, leaveBedroom);
      return;
    }
    setIsDoorLit(true);
    later(lightCoverMs, () => {
      setArrival("arrived");
      leaveBedroom();
    });
    later(lightOutStartMs + walkIn.lightOutMs, () => setIsDoorLit(false));
  }

  function handleListen() {
    markArrived();
    setArrival("arriving");
    leaveBedroom();
  }

  function handleHeadHome(homecoming: Homecoming) {
    function goHome() {
      setIsBackHome(true);
      setHome(homecoming);
      if (homecoming.kind === "fresh") setHasCleanPile(true);
      setIsBedroomGone(false);
      setArrival("hidden");
    }
    if (prefersReducedMotion) {
      goHome();
      return;
    }
    setHomeVeil("dimming");
    later(HEAD_HOME_DIM_MS, () => {
      goHome();
      setHomeVeil("revealing");
    });
    later(HEAD_HOME_DIM_MS + HEAD_HOME_REVEAL_MS, () => setHomeVeil(undefined));
  }

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setArrival("arrived");
  }

  return (
    <TipProvider>
      <div className="relative size-full">
        <FirstVisitKeyframes motion={bedroom.motion} />
        <div
          data-lm-control
          className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-[max(1.25rem,env(safe-area-inset-right))] z-10 flex flex-col items-end gap-y-1"
        >
          <UpdateNotice />
          <LanguagePicker />
          <SoundToggle />
          <CameraButton onPickUp={() => setIsCameraOut(true)} />
          <PocketButton />
          <ThemeButton />
          <SettingsButton />
          <PortfolioLink />
          <PawsLink />
        </div>
        {isFirstVisit && (
          <div ref={bedroomRef} className="absolute inset-0">
            <FirstVisit
              scene={props.config}
              bedroom={bedroom}
              hourOverride={props.hourOverride}
              home={home}
              cleanPile={hasCleanPile}
              lampSwitch={lampSwitch}
              curtainOpen={isCurtainOpen}
              onLampSwitch={setLampSwitch}
              onCurtainOpenChange={setIsCurtainOpen}
              onWalkIn={handleWalkIn}
              onListen={handleListen}
              cameraHeld={isCameraOut}
              onPickUpCamera={() => setIsCameraOut(true)}
            />
          </div>
        )}
        <div
          ref={sceneRef}
          tabIndex={-1}
          data-lm-arrival={visibleArrival}
          className="absolute inset-0 outline-none data-[lm-arrival=hidden]:pointer-events-none data-[lm-arrival=hidden]:opacity-0"
          onAnimationEnd={handleAnimationEnd}
        >
          <LaundromatScene
            config={props.config}
            hourOverride={props.hourOverride}
            onHeadHome={handleHeadHome}
            hidden={visibleArrival === "hidden"}
            cameraHeld={isCameraOut}
            onPickUpCamera={() => setIsCameraOut(true)}
          />
        </div>
        {isDoorLit && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              duration: walkIn.lightOutMs / 1000,
              delay: lightOutStartMs / 1000,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute inset-0 bg-[var(--lm-accent-hi)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: LIGHT_FILL_MS / 1000,
                delay: (lightCoverMs - LIGHT_FILL_MS) / 1000,
                ease: "easeIn",
              }}
            />
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "color-mix(in srgb, var(--lm-accent-hi) 20%, white)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: walkIn.whiteMs / 1000,
                delay: lightCoverMs / 1000,
                ease: "easeOut",
              }}
            />
          </motion.div>
        )}
        <AnimatePresence>
          {isCameraOut && (
            <InstantCamera
              key="instant-camera"
              subject={isFirstVisit ? "bedroom" : "laundromat"}
              background={props.config.tokens.bg}
              onPutDown={() => setIsCameraOut(false)}
            />
          )}
        </AnimatePresence>
        {homeVeil !== undefined && (
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: homeVeil === "dimming" ? 1 : 0 }}
            transition={
              homeVeil === "dimming"
                ? { duration: HEAD_HOME_DIM_MS / 1000, ease: "easeIn" }
                : { duration: HEAD_HOME_REVEAL_MS / 1000, ease: "easeOut" }
            }
          />
        )}
      </div>
    </TipProvider>
  );
}
