"use client";

import { useState } from "react";

import { clampViewfinder } from "@/lib/laundromat/instant-camera/clamp-viewfinder";
import { getStartingViewfinder } from "@/lib/laundromat/instant-camera/get-starting-viewfinder";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import { scaleViewfinder } from "@/lib/laundromat/instant-camera/scale-viewfinder";
import { sizeViewfinder } from "@/lib/laundromat/instant-camera/size-viewfinder";
import { turnViewfinder } from "@/lib/laundromat/instant-camera/turn-viewfinder";
import type {
  ViewfinderFrame,
  ViewfinderOrientation,
} from "@/lib/laundromat/instant-camera/viewfinder-frame";

import { useViewportSize } from "./use-viewport-size";

const KEY_STEP_PX = 10;
const KEY_STEP_LARGE_PX = 40;
const KEY_SCALE_STEP = 0.08;

/** Hold where the viewfinder sits on screen and which way it is turned, kept inside the window, and return it with the window size, a setter, `turn`, and `pressKey`, which moves, resizes or turns the frame for a key press and returns `"snap"` for Enter or Space. */
export function useViewfinderFrame() {
  const viewport = useViewportSize();
  const [orientation, setOrientation] =
    useState<ViewfinderOrientation>("portrait");
  const [frame, setFrame] = useState<ViewfinderFrame>();
  const minShortPx = INSTANT_CAMERA.viewfinderMinShortPx;
  const visibleFrame = (() => {
    if (viewport === undefined) return undefined;
    if (frame === undefined) {
      return getStartingViewfinder({ orientation, viewport, minShortPx });
    }
    return clampViewfinder({
      frame: {
        ...frame,
        ...sizeViewfinder({
          orientation,
          width: frame.width,
          viewport,
          minShortPx,
        }),
      },
      viewport,
    });
  })();

  function turn() {
    const next = orientation === "portrait" ? "landscape" : "portrait";
    setOrientation(next);
    if (visibleFrame !== undefined && viewport !== undefined) {
      setFrame(
        turnViewfinder({
          frame: visibleFrame,
          orientation: next,
          viewport,
          minShortPx,
        })
      );
    }
  }

  function pressKey(event: React.KeyboardEvent) {
    if (visibleFrame === undefined || viewport === undefined) return undefined;
    const step = event.shiftKey ? KEY_STEP_LARGE_PX : KEY_STEP_PX;
    const moves: { [key: string]: [number, number] } = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      setFrame(
        clampViewfinder({
          frame: {
            ...visibleFrame,
            x: visibleFrame.x + move[0],
            y: visibleFrame.y + move[1],
          },
          viewport,
        })
      );
      return undefined;
    }
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        return "snap";
      case "o":
      case "O":
        turn();
        return undefined;
      case "+":
      case "=":
      case "-":
        setFrame(
          scaleViewfinder({
            frame: visibleFrame,
            factor: event.key === "-" ? 1 - KEY_SCALE_STEP : 1 + KEY_SCALE_STEP,
            orientation,
            viewport,
            minShortPx,
          })
        );
        return undefined;
      default:
        return undefined;
    }
  }

  return {
    viewport,
    orientation,
    visibleFrame,
    setFrame,
    turn,
    pressKey,
  };
}
