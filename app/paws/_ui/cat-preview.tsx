"use client";

import { useEffect, useRef } from "react";

import type { CatLook } from "@/lib/paws/cat-look";
import { drawCatPreview } from "@/lib/paws/render/draw-cat-preview";

import { PENDING_COPY } from "./pending-copy";

const STILL_TIME = 0;

type CatPreviewProps = {
  look: CatLook;
};

/** Render the cat sitting under the glass on a canvas, animated unless the visitor prefers reduced motion. */
export function CatPreview(props: CatPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef(props.look);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    lookRef.current = props.look;
    redrawRef.current();
  }, [props.look]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame: number | undefined;

    function draw(time: number) {
      if (!canvas || !g || width === 0 || height === 0) return;
      drawCatPreview({ g, look: lookRef.current, width, height, time, dpr });
    }

    function loop(now: number) {
      draw(now / 1000);
      frame = requestAnimationFrame(loop);
    }

    function stop() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
    }

    function start() {
      stop();
      if (motionQuery.matches) draw(STILL_TIME);
      else frame = requestAnimationFrame(loop);
    }

    function resize() {
      if (!canvas) return;
      const box = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (motionQuery.matches) draw(STILL_TIME);
    }

    function redrawStill() {
      if (motionQuery.matches) draw(STILL_TIME);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    motionQuery.addEventListener("change", start);
    redrawRef.current = redrawStill;
    resize();
    start();

    return () => {
      stop();
      observer.disconnect();
      motionQuery.removeEventListener("change", start);
      redrawRef.current = () => {};
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={PENDING_COPY.previewLabel}
      className="block aspect-[2/1] w-full border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper-deep)]"
    />
  );
}
