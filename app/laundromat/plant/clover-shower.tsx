"use client";

import { useEffect, useRef } from "react";

import { createFallingClovers } from "@/lib/laundromat/plant/create-falling-clovers";
import { getCloverPose } from "@/lib/laundromat/plant/get-clover-pose";

import type { CloverGreens } from "./draw-clover-sprite";
import { drawCloverSprite } from "./draw-clover-sprite";

const CLOVER_GREENS = [
  { leaf: "#3fa944", shadow: "#33923a", vein: "#7fd06f", edge: "#25742b" },
  { leaf: "#4cb84a", shadow: "#3c9f3f", vein: "#8edb7c", edge: "#2b7f2f" },
  { leaf: "#35983f", shadow: "#2b8134", vein: "#6fc265", edge: "#1f6526" },
] satisfies CloverGreens[];
const SPRITE_PX = 128;
const PX_PER_CLOVER = 13000;

type CloverShowerProps = {
  lite: boolean;
  still: boolean;
  onDone: () => void;
};

/** A full-screen shower of falling, spinning four-leaf clovers that calls `onDone` once the last one has left the screen. */
export function CloverShower(props: CloverShowerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(props);
  useEffect(() => {
    settingsRef.current = props;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { lite, still } = settingsRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, lite ? 1 : 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    const sprites = CLOVER_GREENS.map((greens) =>
      drawCloverSprite({ sizePx: SPRITE_PX, greens })
    );
    const areaCount = Math.round((width * height) / PX_PER_CLOVER);
    const count = lite
      ? Math.min(40, Math.max(20, Math.round(areaCount / 2)))
      : Math.min(130, Math.max(50, areaCount));
    const clovers = createFallingClovers({
      count: still ? Math.round(count / 3) : count,
      viewport: { width, height },
      shadeCount: sprites.length,
    });
    const durationS = Math.max(
      ...clovers.map(({ delayS, fallS }) => delayS + fallS)
    );
    const gustA = Math.random() * Math.PI * 2;
    const gustB = Math.random() * Math.PI * 2;
    const startMs = performance.now();
    let frame = 0;

    const draw = (nowMs: number) => {
      const timeS = (nowMs - startMs) / 1000;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (timeS >= durationS) {
        settingsRef.current.onDone();
        return;
      }
      const gustPx =
        55 * Math.sin(0.5 * timeS + gustA) + 22 * Math.sin(1.7 * timeS + gustB);
      clovers.forEach((clover) => {
        const pose = getCloverPose({
          clover,
          timeS,
          viewportHeight: height,
          gustPx,
          still,
        });
        const sprite = sprites[clover.shade];
        if (pose === undefined || sprite === undefined) return;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.translate(pose.x, pose.y);
        context.rotate(pose.rotation);
        context.scale(1, pose.flip);
        context.globalAlpha = pose.opacity;
        context.drawImage(
          sprite,
          -clover.sizePx / 2,
          -clover.sizePx / 2,
          clover.sizePx,
          clover.sizePx
        );
      });
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
