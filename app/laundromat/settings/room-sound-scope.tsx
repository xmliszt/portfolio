"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

import { getRoomSoundTrace } from "@/lib/laundromat/audio/get-room-sound-trace";
import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";

const CANVAS = { widthPx: 120, heightPx: 68 };

const TRACE = {
  heightRatio: 0.34,
  maxAmplitude: 1.25,
  lineWidthPx: 2,
  minAlpha: 0.4,
  glowPx: 6,
  afterglowFade: 0.35,
  stillTimeS: 1.3,
};

const POWER_ON = { delayMs: 120, durationMs: 320 };

const SCREEN_STYLE = {
  borderRadius: "6px / 9px",
  backgroundImage: [
    "linear-gradient(90deg, transparent calc(25% - 0.5px), color-mix(in oklab, var(--lm-accent) 7%, transparent) calc(25% - 0.5px) calc(25% + 0.5px), transparent calc(25% + 0.5px) calc(75% - 0.5px), color-mix(in oklab, var(--lm-accent) 7%, transparent) calc(75% - 0.5px) calc(75% + 0.5px), transparent calc(75% + 0.5px))",
    "linear-gradient(0deg, transparent calc(50% - 0.5px), color-mix(in oklab, var(--lm-accent) 10%, transparent) calc(50% - 0.5px) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
    "radial-gradient(ellipse at 50% 45%, #1c1309 0%, #0a0704 80%)",
  ].join(", "),
};

const SCANLINES_STYLE = {
  backgroundImage:
    "repeating-linear-gradient(0deg, rgb(0 0 0 / 0.32) 0 1px, transparent 1px 2px)",
};

const GLASS_STYLE = {
  backgroundImage:
    "radial-gradient(ellipse at 28% 18%, rgb(255 255 255 / 0.08), transparent 42%), radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / 0.65) 100%)",
};

type RoomSoundScopeProps = {
  group: RoomSoundGroup;
  turn: MotionValue<number>;
  on: boolean;
  still: boolean;
  delayMs: number;
};

/** Draw a small amber CRT whose trace is `group`'s waveform scaled by `turn`, flat at 0 and full at 1; it moves with phosphor afterglow unless `still`. */
export function RoomSoundScope(props: RoomSoundScopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { group, turn, still } = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const accent = getComputedStyle(canvas)
      .getPropertyValue("--lm-accent")
      .trim();

    function draw(timeS: number) {
      if (!canvas || !context) return;
      const { width, height } = canvas;
      const amplitude = Math.min(TRACE.maxAmplitude, Math.max(0, turn.get()));
      context.shadowBlur = 0;
      context.globalAlpha = 1;
      if (still) {
        context.clearRect(0, 0, width, height);
      } else {
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = `rgb(0 0 0 / ${TRACE.afterglowFade})`;
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
      }
      context.beginPath();
      for (let px = 0; px <= width; px += 1) {
        const y =
          height / 2 -
          getRoomSoundTrace({ group, x: px / width, timeS }) *
            amplitude *
            height *
            TRACE.heightRatio;
        if (px === 0) context.moveTo(px, y);
        else context.lineTo(px, y);
      }
      context.lineWidth = TRACE.lineWidthPx;
      context.strokeStyle = accent;
      context.globalAlpha =
        TRACE.minAlpha + Math.min(1, amplitude) * (1 - TRACE.minAlpha);
      if (!still) {
        context.shadowBlur = TRACE.glowPx;
        context.shadowColor = accent;
      }
      context.stroke();
    }

    if (still) {
      draw(TRACE.stillTimeS);
      return turn.on("change", () => draw(TRACE.stillTimeS));
    }
    const frame = { id: 0 };
    function tick(nowMs: number) {
      draw(nowMs / 1000);
      frame.id = requestAnimationFrame(tick);
    }
    frame.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.id);
  }, [group, turn, still]);

  const wasOnRef = useRef(props.on);
  const { on, delayMs } = props;
  useEffect(() => {
    const wasOn = wasOnRef.current;
    wasOnRef.current = on;
    if (still || wasOn || !on) return;
    const animation = canvasRef.current?.animate(
      [
        { transform: "scaleY(0.08)", filter: "brightness(2.4)" },
        { transform: "scaleY(1.06)", filter: "brightness(1.4)", offset: 0.55 },
        { transform: "none", filter: "none" },
      ],
      {
        duration: POWER_ON.durationMs,
        delay: delayMs + POWER_ON.delayMs,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      }
    );
    return () => animation?.cancel();
  }, [on, still, delayMs]);

  return (
    <span
      aria-hidden
      className="block h-[42px] w-[68px] rounded-lg bg-[linear-gradient(180deg,#2a2b2e,#17181a)] p-1 shadow-[inset_0_0_0_1px_#000,inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.6)]"
    >
      <span
        className="relative block size-full overflow-hidden shadow-[inset_0_0_10px_rgb(0_0_0/0.95)]"
        style={SCREEN_STYLE}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS.widthPx}
          height={CANVAS.heightPx}
          className="absolute inset-0 size-full"
        />
        <span className="absolute inset-0" style={SCANLINES_STYLE} />
        <span className="absolute inset-0" style={GLASS_STYLE} />
      </span>
    </span>
  );
}
