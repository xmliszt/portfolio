"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { GUIDE_FADE_SECONDS } from "@/lib/paws/guide/guide-fade-seconds";
import { GUIDE_STEPS_PER_SECOND } from "@/lib/paws/guide/guide-steps-per-second";
import { GUIDE_TAKES } from "@/lib/paws/guide/guide-takes";
import type { GuideFrame } from "@/lib/paws/guide/guide-types";
import { runGuideTake } from "@/lib/paws/guide/run-guide-take";
import { createSceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";
import { deriveCat } from "@/lib/paws/sim/derive-cat";

const MAX_DPR = 2;

type GuidePreviewProps = {
  take: keyof typeof GUIDE_TAKES;
  label: string;
  /** Take time of the still frame shown when motion is reduced. */
  posterAt: number;
};

function createCanvas(options: { width: number; height: number }) {
  const created = document.createElement("canvas");
  created.width = options.width;
  created.height = options.height;
  return created;
}

/** Render one guide take on a loop with the real room renderer, its last moments fading over its first, playing only while on screen, and as one still frame at `posterAt` when motion is reduced. */
export function GuidePreview(props: GuidePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotion() ?? false;

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (canvas === null || g === null || g === undefined) return;
    const take = GUIDE_TAKES[props.take];
    const looks = Object.fromEntries(
      take.cats.map((cat) => [cat.userId, cat.look])
    );
    const resources = createSceneResources({ createCanvas, paperSeed: 0.37 });
    const tail = createCanvas({ width: 1, height: 1 });
    const tailG = tail.getContext("2d");
    const playback: {
      frames: GuideFrame[] | undefined;
      isVisible: boolean;
      rafId: number;
      startMs: number | undefined;
    } = { frames: undefined, isVisible: false, rafId: 0, startMs: undefined };

    function frameAt(t: number) {
      const frames = playback.frames ?? [];
      const index = Math.min(
        frames.length - 1,
        Math.max(0, Math.round(t * GUIDE_STEPS_PER_SECOND))
      );
      return frames.at(index);
    }

    function paint(options: {
      target: CanvasRenderingContext2D;
      frame: GuideFrame;
      clock: number;
      width: number;
      height: number;
      dpr: number;
    }) {
      const { frame, width, height } = options;
      const scale = width / take.span;
      const shift = options.clock - frame.time;
      drawScene({
        g: options.target,
        width,
        height,
        dpr: options.dpr,
        view: {
          scale,
          offsetX: width / 2 - frame.camera.x * scale,
          offsetY: height / 2 - frame.camera.y * scale,
        },
        cats: frame.cats.flatMap((snapshot) => {
          const look = looks[snapshot.userId];
          return look === undefined
            ? []
            : [deriveCat({ snapshot, look, time: frame.time })];
        }),
        prints: frame.prints.map((print) => ({
          ...print,
          bornAt: print.bornAt + shift,
        })),
        fingers: frame.fingers,
        time: options.clock,
        resources,
      });
    }

    function draw(clock: number) {
      if (canvas === null || g === null || g === undefined) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const deviceWidth = Math.round(width * dpr);
      const deviceHeight = Math.round(height * dpr);
      if (canvas.width !== deviceWidth || canvas.height !== deviceHeight) {
        canvas.width = deviceWidth;
        canvas.height = deviceHeight;
      }
      const phase = isReduced ? props.posterAt : clock % take.loopSeconds;
      const frame = frameAt(phase);
      if (frame === undefined) return;
      paint({ target: g, frame, clock, width, height, dpr });
      const tailFrame = frameAt(take.loopSeconds + phase);
      if (isReduced || phase >= GUIDE_FADE_SECONDS || tailFrame === undefined)
        return;
      if (tail.width !== deviceWidth || tail.height !== deviceHeight) {
        tail.width = deviceWidth;
        tail.height = deviceHeight;
      }
      if (tailG === null) return;
      paint({ target: tailG, frame: tailFrame, clock, width, height, dpr });
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1 - phase / GUIDE_FADE_SECONDS;
      g.drawImage(tail, 0, 0);
      g.restore();
    }

    function tick(nowMs: number) {
      playback.startMs ??= nowMs;
      draw((nowMs - playback.startMs) / 1000);
      if (playback.isVisible && !isReduced)
        playback.rafId = window.requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible === playback.isVisible) return;
      playback.isVisible = isVisible;
      window.cancelAnimationFrame(playback.rafId);
      if (!isVisible) return;
      playback.frames ??= runGuideTake(take);
      playback.rafId = window.requestAnimationFrame(tick);
    });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(() => {
      if (!isReduced || !playback.isVisible) return;
      window.cancelAnimationFrame(playback.rafId);
      playback.rafId = window.requestAnimationFrame(tick);
    });
    resizeObserver.observe(canvas);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.cancelAnimationFrame(playback.rafId);
    };
  }, [props.take, props.posterAt, isReduced]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={props.label}
      className="block aspect-[16/10] w-full border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper-deep)]"
    />
  );
}
