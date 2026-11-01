"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  usePresence,
  useReducedMotion,
} from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { useViewfinderFrame } from "@/components/instant-camera/use-viewfinder-frame";
import { Viewfinder } from "@/components/instant-camera/viewfinder";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import { pickPolaroidTiltDeg } from "@/lib/laundromat/instant-camera/pick-polaroid-tilt-deg";
import { cn } from "@/lib/utils";

import { CameraGrip } from "./camera-grip";
import { captureRoomPhoto } from "./capture-room-photo";
import { paintFilmLook } from "./paint-film-look";
import type { Photo } from "./polaroid-sheet";
import { PolaroidSheet } from "./polaroid-sheet";

const MIN_FLASH_MS = 380;
const PUT_DOWN_MS = 450;

export type InstantCameraSubject = "laundromat" | "bedroom";

type CameraStage =
  | { kind: "framing" }
  | { kind: "snapping" }
  | { kind: "print"; photo: Photo };

type InstantCameraProps = {
  subject: InstantCameraSubject;
  background: string;
  onPutDown: () => void;
};

/** Hold the instant camera up to the room: set `data-lm-camera-out` on `[data-laundromat-root]` while it is out, frame part of the screen in the viewfinder, snap it from the room's own drawing, then show the developed polaroid to write on and share; key presses inside stay with the camera. */
export function InstantCamera(props: InstantCameraProps) {
  const { copy } = useLaundromatCopy();
  const { quality } = useRenderQuality();
  const sound = useSoundBoard();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { viewport, orientation, visibleFrame, setFrame, turn, pressKey } =
    useViewfinderFrame();
  const [stage, setStage] = useState<CameraStage>({ kind: "framing" });
  const [flashCount, setFlashCount] = useState(0);
  const [isSnapFailed, setIsSnapFailed] = useState(false);
  const snapRunRef = useRef(0);
  const ejectTimerRef = useRef<number>(undefined);
  const [isPresent, safeToRemove] = usePresence();
  const fontCacheRef = useRef<{ [url: string]: string | undefined }>({});
  const isMeasured = viewport !== undefined;

  useEffect(() => {
    const root = document.querySelector("[data-laundromat-root]");
    root?.setAttribute("data-lm-camera-out", "");
    return () => root?.removeAttribute("data-lm-camera-out");
  }, []);

  useEffect(() => {
    if (isPresent) return;
    snapRunRef.current += 1;
    window.clearTimeout(ejectTimerRef.current);
    const timer = window.setTimeout(safeToRemove, PUT_DOWN_MS);
    return () => window.clearTimeout(timer);
  }, [isPresent, safeToRemove]);

  useEffect(() => {
    const runs = snapRunRef;
    return () => {
      runs.current += 1;
      window.clearTimeout(ejectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (stage.kind !== "framing") return;
    const viewfinder = document.querySelector<HTMLElement>(
      "[data-instant-camera-viewfinder]"
    );
    viewfinder?.focus({ preventScroll: true });
  }, [stage.kind, isMeasured]);

  async function snap() {
    if (stage.kind !== "framing" || visibleFrame === undefined) return;
    const svg = document.querySelector<SVGSVGElement>(
      `svg[data-instant-camera-subject="${props.subject}"]`
    );
    if (svg === null) return;
    const run = snapRunRef.current + 1;
    snapRunRef.current = run;
    setIsSnapFailed(false);
    setStage({ kind: "snapping" });
    setFlashCount((count) => count + 1);
    sound?.play("camera-shutter");
    const startedAt = performance.now();
    try {
      const canvas = await captureRoomPhoto({
        svg,
        frame: visibleFrame,
        longPx: INSTANT_CAMERA.photoLongPx[quality],
        background: props.background,
        fontCache: fontCacheRef.current,
      });
      if (snapRunRef.current !== run) return;
      paintFilmLook({ canvas, random: Math.random });
      const url = canvas.toDataURL("image/jpeg", 0.9);
      const waitMs = Math.max(
        0,
        MIN_FLASH_MS - (performance.now() - startedAt)
      );
      ejectTimerRef.current = window.setTimeout(() => {
        if (snapRunRef.current !== run) return;
        sound?.play("camera-eject");
        setStage({
          kind: "print",
          photo: {
            url,
            orientation,
            tiltDeg: pickPolaroidTiltDeg(Math.random),
          },
        });
      }, waitMs);
    } catch {
      if (snapRunRef.current !== run) return;
      setIsSnapFailed(true);
      setStage({ kind: "framing" });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && stage.kind !== "print") {
      props.onPutDown();
      return;
    }
    const isOnViewfinder =
      event.target instanceof HTMLElement &&
      event.target.matches("[data-instant-camera-viewfinder]");
    if (!isOnViewfinder || stage.kind !== "framing") return;
    if (pressKey(event) === "snap") void snap();
  }

  const isFraming = isPresent && stage.kind !== "print";

  return (
    <div
      className="contents"
      onKeyDown={(event) => {
        handleKeyDown(event);
        event.stopPropagation();
      }}
    >
      <AnimatePresence>
        {isFraming && visibleFrame !== undefined && viewport !== undefined && (
          <motion.div
            key="viewfinder"
            className="fixed inset-0 z-[400] touch-none [--camera-accent:var(--lm-accent)] [--camera-dim:rgba(6,7,8,0.62)] [--camera-ink-hi:var(--lm-ink-hi)] [--camera-ink:var(--lm-ink)]"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.3, 0.7, 0.2, 1] }}
          >
            <Viewfinder
              frame={visibleFrame}
              orientation={orientation}
              viewport={viewport}
              label={copy.instantCamera.viewfinderLabel}
              flashCount={flashCount}
              onFrameChange={setFrame}
            />
            <p
              role="status"
              className={cn(
                "pointer-events-none absolute top-[max(1.1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap lowercase",
                isSnapFailed
                  ? "text-[var(--lm-ink-hi)]"
                  : "text-[var(--lm-ink)]"
              )}
            >
              {isSnapFailed
                ? copy.instantCamera.snapFailed
                : copy.instantCamera.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isFraming && (
          <motion.div
            key="grip"
            className="fixed bottom-0 left-1/2 z-[400] -translate-x-1/2"
            initial={prefersReducedMotion ? false : { y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.45, ease: [0.3, 0.7, 0.2, 1] }}
          >
            <CameraGrip
              orientation={orientation}
              busy={stage.kind === "snapping"}
              onPutDown={props.onPutDown}
              onShutter={() => void snap()}
              onTurn={turn}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPresent && stage.kind === "print" && (
          <PolaroidSheet
            key={stage.photo.url}
            photo={stage.photo}
            onRetake={() => {
              setFlashCount(0);
              setStage({ kind: "framing" });
            }}
            onDone={props.onPutDown}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
