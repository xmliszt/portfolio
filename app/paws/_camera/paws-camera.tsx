"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  usePresence,
  useReducedMotion,
} from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { useUiSound } from "@/app/paws/_room/use-ui-sound";
import { useViewfinderFrame } from "@/components/instant-camera/use-viewfinder-frame";
import { Viewfinder } from "@/components/instant-camera/viewfinder";
import { pickPolaroidTiltDeg } from "@/lib/laundromat/instant-camera/pick-polaroid-tilt-deg";
import type { ViewfinderFrame } from "@/lib/laundromat/instant-camera/viewfinder-frame";
import { cn } from "@/lib/utils";

import { CameraGrip } from "./camera-grip";
import { paintPhotoVignette } from "./paint-photo-vignette";
import { PAWS_CAMERA } from "./paws-camera-config";
import { type PawsPhoto, PhotoSheet } from "./photo-sheet";

const MIN_FLASH_MS = 380;
const PUT_DOWN_MS = 450;

type CameraStage =
  | { kind: "framing" }
  | { kind: "snapping" }
  | { kind: "print"; photo: PawsPhoto };

type PawsCameraProps = {
  inviteUrl: string;
  capture: (options: {
    frame: ViewfinderFrame;
    longPx: number;
  }) => HTMLCanvasElement;
  onPutDown: () => void;
};

/** Hold the instant camera up to the room: frame part of the screen in the viewfinder while the room keeps moving under it, snap it with `capture`, then show the developed photo to write on and share with an invite into the room; key presses inside stay with the camera. */
export function PawsCamera(props: PawsCameraProps) {
  const { copy } = usePawsCopy();
  const playUi = useUiSound();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { viewport, orientation, visibleFrame, setFrame, turn, pressKey } =
    useViewfinderFrame();
  const [stage, setStage] = useState<CameraStage>({ kind: "framing" });
  const [flashCount, setFlashCount] = useState(0);
  const [isSnapFailed, setIsSnapFailed] = useState(false);
  const ejectTimerRef = useRef<number>(undefined);
  const [isPresent, safeToRemove] = usePresence();
  const isMeasured = viewport !== undefined;

  useEffect(() => {
    if (isPresent) return;
    window.clearTimeout(ejectTimerRef.current);
    const timer = window.setTimeout(safeToRemove, PUT_DOWN_MS);
    return () => window.clearTimeout(timer);
  }, [isPresent, safeToRemove]);

  useEffect(() => () => window.clearTimeout(ejectTimerRef.current), []);

  useEffect(() => {
    if (stage.kind !== "framing") return;
    const viewfinder = document.querySelector<HTMLElement>(
      "[data-instant-camera-viewfinder]"
    );
    viewfinder?.focus({ preventScroll: true });
  }, [stage.kind, isMeasured]);

  function snap() {
    if (stage.kind !== "framing" || visibleFrame === undefined) return;
    setIsSnapFailed(false);
    setStage({ kind: "snapping" });
    setFlashCount((count) => count + 1);
    playUi("shutter");
    const startedAt = performance.now();
    try {
      const canvas = props.capture({
        frame: visibleFrame,
        longPx: PAWS_CAMERA.photoLongPx,
      });
      paintPhotoVignette(canvas);
      const url = canvas.toDataURL("image/jpeg", 0.9);
      const waitMs = Math.max(
        0,
        MIN_FLASH_MS - (performance.now() - startedAt)
      );
      ejectTimerRef.current = window.setTimeout(() => {
        playUi("eject");
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
    if (pressKey(event) === "snap") snap();
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
            role="dialog"
            aria-modal="true"
            aria-label={copy.camera.open}
            className="fixed inset-0 z-50 touch-none [--camera-accent:var(--pw-pink)] [--camera-dim:rgba(43,58,99,0.38)] [--camera-ink-hi:var(--pw-paper)] [--camera-ink:var(--pw-ink)]"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.3, 0.7, 0.2, 1] }}
          >
            <Viewfinder
              frame={visibleFrame}
              orientation={orientation}
              viewport={viewport}
              label={copy.camera.viewfinderLabel}
              flashCount={flashCount}
              onFrameChange={setFrame}
            />
            <p
              role="status"
              className={cn(
                "pointer-events-none absolute top-[max(1rem,env(safe-area-inset-top))] left-1/2 m-0 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-2.5 py-1 text-center text-[12px] text-balance",
                isSnapFailed ? "text-[var(--pw-pink)]" : "text-[var(--pw-ink)]"
              )}
            >
              {isSnapFailed ? copy.camera.snapFailed : copy.camera.hint}
            </p>
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              initial={prefersReducedMotion ? false : { y: "110%" }}
              animate={{ y: 0 }}
              exit={{ y: "110%" }}
              transition={{ duration: 0.45, ease: [0.3, 0.7, 0.2, 1] }}
            >
              <CameraGrip
                orientation={orientation}
                busy={stage.kind === "snapping"}
                onPutDown={props.onPutDown}
                onShutter={snap}
                onTurn={turn}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPresent && stage.kind === "print" && (
          <PhotoSheet
            key={stage.photo.url}
            photo={stage.photo}
            inviteUrl={props.inviteUrl}
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
