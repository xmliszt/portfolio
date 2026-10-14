"use client";

import { Fragment, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Fredoka } from "next/font/google";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getGoodNightProgress } from "@/lib/laundromat/first-visit/get-good-night-progress";
import { GOOD_NIGHT_MUSIC } from "@/lib/laundromat/good-night-music";
import { cn } from "@/lib/utils";

const storybook = Fredoka({
  subsets: ["latin", "latin-ext"],
  weight: ["600"],
  preload: false,
  display: "swap",
});

const CREDIT_LINK =
  "inline-block py-1.5 underline-offset-2 transition-colors duration-200 outline-none hover:text-[#1b2457] hover:underline focus-visible:outline-1 focus-visible:outline-[#3b3f8a] focus-visible:outline-dashed";
const REDUCED_FADE_MS = 1500;
const SWAY = { deg: 0.5, periodMs: 6500 };
const TEXT_RISE_VMIN = 1.5;
const TEXT_BLUR_PX = 6;
const PAPER = "#fff6dc";
const STAR_COLOR = "#ffd76a";
const MOON_COLOR = "#ffe08a";
const SHADOW_COLOR = "rgba(12, 10, 48, 0.32)";
const SHADOW_OFFSET = { star: 7, cloud: -4, moon: 6 };
const CLOUD_PATH =
  "M10 90 C0 60 30 42 52 52 C58 22 98 10 116 36 C132 18 172 24 172 54 C196 50 206 76 192 90 Z";
const FACE_COLOR = "#6b4a2b";
const CHEEK_COLOR = "#ff9fb0";
const FABRIC = [
  "repeating-linear-gradient(90deg, rgba(10,8,40,0.16) 0, rgba(255,255,255,0.05) 4vmin, rgba(10,8,40,0.16) 8vmin)",
  "linear-gradient(180deg, #1b2457 0%, #2c3478 38%, #4d4895 70%, #7a63ad 100%)",
].join(", ");
const STAR_PATH = (() => {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? 46 : 21;
    const angle = (Math.PI / 5) * index - Math.PI / 2;
    return `${50 + radius * Math.cos(angle)},${52 + radius * Math.sin(angle)}`;
  });
  return `M ${points.join(" L ")} Z`;
})();
const STARS = [
  { x: 7, y: 10, size: 4.4 },
  { x: 19, y: 24, size: 2.6 },
  { x: 29, y: 8, size: 3.4 },
  { x: 40, y: 18, size: 2.2 },
  { x: 52, y: 6, size: 2.8 },
  { x: 56, y: 28, size: 2 },
  { x: 91, y: 9, size: 3 },
  { x: 94, y: 32, size: 2.2 },
  { x: 87, y: 45, size: 3.6 },
  { x: 12, y: 40, size: 3 },
  { x: 5, y: 60, size: 2.2 },
  { x: 22, y: 64, size: 2.8 },
  { x: 77, y: 62, size: 2.6 },
  { x: 93, y: 68, size: 3.2 },
  { x: 35, y: 34, size: 1.8 },
  { x: 67, y: 38, size: 1.8 },
  { x: 45, y: 72, size: 2 },
  { x: 68, y: 75, size: 2.4 },
];
const SPARKLES = [
  { x: 14, y: 17 },
  { x: 34, y: 26 },
  { x: 47, y: 12 },
  { x: 60, y: 16 },
  { x: 86, y: 25 },
  { x: 97, y: 50 },
  { x: 9, y: 49 },
  { x: 28, y: 52 },
  { x: 74, y: 50 },
  { x: 83, y: 76 },
  { x: 16, y: 76 },
  { x: 57, y: 64 },
];
const CLOUDS = [
  { x: -6, width: 34, color: "#d8e4ff" },
  { x: 22, width: 30, color: "#f7d9e8" },
  { x: 47, width: 36, color: "#fff0d2" },
  { x: 76, width: 34, color: "#e2d8ff" },
];

type GoodNightDropProps = {
  audio: HTMLAudioElement;
  playback: Promise<void>;
  timing: BedroomConfig["motion"]["goodNight"];
};

/** Lower a storybook stage drop over the whole screen in time with the music box, with pasted twinkling stars and a sleepy crescent moon, and fade in "good night" once it lands; a corner button reloads the page. Everything else in the laundromat root is `inert` while it is shown. */
export function GoodNightDrop(props: GoodNightDropProps) {
  const { copy } = useLaundromatCopy();
  const { quality } = useRenderQuality();
  const isReducedMotion = useReducedMotion() ?? false;
  const isLively = quality === "full" && !isReducedMotion;
  const { audio, playback, timing } = props;
  const layerRef = useRef<HTMLDivElement>(null);
  const clockStartRef = useRef<number>(undefined);
  const drop = useMotionValue(0);
  const text = useMotionValue(0);
  const sway = useMotionValue(0);
  const dropY = useTransform(drop, (value) =>
    isReducedMotion ? "0%" : `${(value - 1) * 100}%`
  );
  const dropOpacity = useTransform(drop, (value) =>
    isReducedMotion ? value : 1
  );
  const textY = useTransform(
    text,
    (value) => `${(1 - value) * TEXT_RISE_VMIN}vmin`
  );
  const textFilter = useTransform(text, (value) =>
    isLively && value < 1 ? `blur(${(1 - value) * TEXT_BLUR_PX}px)` : "none"
  );

  useEffect(() => {
    const layer = layerRef.current;
    const root = layer?.parentElement;
    if (!layer || !root) return;
    const behind = [...root.children].flatMap((child) =>
      child !== layer && child instanceof HTMLElement && !child.inert
        ? [child]
        : []
    );
    behind.forEach((child) => (child.inert = true));
    layer.focus();
    return () => behind.forEach((child) => (child.inert = false));
  }, []);

  useEffect(() => {
    let frame = 0;
    function startClock() {
      clockStartRef.current ??= performance.now();
    }
    playback.catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        startClock();
      }
    });
    audio.addEventListener("error", startClock);
    function tick(nowMs: number) {
      const clockStartMs = clockStartRef.current;
      const elapsedMs =
        clockStartMs === undefined
          ? audio.currentTime * 1000
          : nowMs - clockStartMs;
      const progress = getGoodNightProgress({ elapsedMs, ...timing });
      drop.set(
        isReducedMotion
          ? Math.min(elapsedMs / REDUCED_FADE_MS, 1)
          : progress.drop
      );
      text.set(progress.text);
      sway.set(
        isLively
          ? SWAY.deg *
              (1 - progress.drop) *
              Math.sin((2 * Math.PI * elapsedMs) / SWAY.periodMs)
          : 0
      );
      if (progress.text < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      audio.removeEventListener("error", startClock);
    };
  }, [audio, playback, timing, drop, text, sway, isReducedMotion, isLively]);

  useEffect(() => {
    if (audio.paused && !audio.ended) audio.play().catch(() => undefined);
    return () => audio.pause();
  }, [audio]);

  function handleWakeUp() {
    window.location.reload();
  }

  return createPortal(
    <div
      ref={layerRef}
      role="dialog"
      aria-modal
      tabIndex={-1}
      aria-label={copy.firstVisit.goodNight}
      className="fixed inset-0 z-[999] overflow-hidden outline-none"
    >
      <style>{`
@keyframes lm-gn-twinkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(0.8) rotate(-10deg); opacity: 0.72; }
}
@keyframes lm-gn-sparkle {
  0%, 100% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1); opacity: 1; }
}
@keyframes lm-gn-doze {
  0%, 100% { transform: translateY(0) rotate(-14deg); }
  50% { transform: translateY(0.8vmin) rotate(-10deg); }
}
`}</style>
      <motion.div
        className="absolute inset-0 origin-top will-change-transform"
        style={{ y: dropY, opacity: dropOpacity, rotate: sway }}
      >
        <div className="absolute bottom-full left-[12%] h-[100vh] w-[0.35vmin] bg-[#e8d6b4]" />
        <div className="absolute right-[12%] bottom-full h-[100vh] w-[0.35vmin] bg-[#e8d6b4]" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ background: FABRIC }}
        >
          <div className="absolute inset-0 origin-bottom-left max-sm:scale-[1.6]">
            {CLOUDS.map((cloud) => (
              <Cloud key={cloud.x} {...cloud} />
            ))}
          </div>
          {STARS.map((star, index) => (
            <svg
              key={`${star.x},${star.y}`}
              aria-hidden
              viewBox="-8 -6 116 116"
              className="absolute -translate-1/2 overflow-visible"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}vmin`,
                height: `${star.size}vmin`,
                animation: isLively
                  ? `lm-gn-twinkle ${2.6 + (index % 5) * 0.45}s ease-in-out ${-(index * 0.37) % 3}s infinite`
                  : undefined,
              }}
            >
              <path
                d={STAR_PATH}
                transform={`translate(0 ${SHADOW_OFFSET.star})`}
                fill={SHADOW_COLOR}
                stroke={SHADOW_COLOR}
                strokeWidth={9}
                strokeLinejoin="round"
              />
              <path
                d={STAR_PATH}
                fill={STAR_COLOR}
                stroke={PAPER}
                strokeWidth={9}
                strokeLinejoin="round"
                paintOrder="stroke"
              />
            </svg>
          ))}
          {SPARKLES.map((sparkle, index) => (
            <svg
              key={`${sparkle.x},${sparkle.y}`}
              aria-hidden
              viewBox="0 0 20 20"
              className="absolute size-[1.4vmin] -translate-1/2"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                opacity: isLively ? undefined : 0.8,
                animation: isLively
                  ? `lm-gn-sparkle ${1.8 + (index % 4) * 0.5}s ease-in-out ${-(index * 0.53) % 2.4}s infinite`
                  : undefined,
              }}
            >
              <path
                d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0 Z"
                fill={PAPER}
              />
            </svg>
          ))}
          <SleepyMoon dozing={isLively} />
          <motion.p
            className={cn(
              storybook.className,
              "absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center text-[clamp(44px,11vmin,140px)] leading-none text-[#fff3d1]"
            )}
            style={{
              opacity: text,
              y: textY,
              filter: textFilter,
              textShadow: "0 0 2.4vmin rgba(255, 220, 140, 0.45)",
            }}
          >
            {copy.firstVisit.goodNight}
          </motion.p>
          <p className="absolute bottom-0 left-4 text-[11px] text-[#3b3f8a]/75 sm:bottom-7 sm:left-9">
            {[
              {
                href: GOOD_NIGHT_MUSIC.url,
                label: `♪ ${GOOD_NIGHT_MUSIC.author} · ${GOOD_NIGHT_MUSIC.title}`,
              },
              {
                href: GOOD_NIGHT_MUSIC.licenseUrl,
                label: GOOD_NIGHT_MUSIC.license,
              },
            ].map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 && " · "}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className={CREDIT_LINK}
                >
                  {link.label}
                </a>
              </Fragment>
            ))}
          </p>
        </div>
        <div className="absolute inset-x-0 top-0 h-[2.4vmin] bg-[linear-gradient(180deg,#d9a46c,#9a6538)] shadow-[0_0.4vmin_0.8vmin_rgba(0,0,0,0.35)]" />
        <div className="absolute inset-x-0 top-full h-[2.2vmin] bg-[radial-gradient(circle_at_50%_0,#f2c76b_2vmin,transparent_2.1vmin)] bg-[length:4.4vmin_4.4vmin] bg-repeat-x" />
      </motion.div>
      <button
        type="button"
        className="absolute right-4 bottom-12 cursor-pointer rounded-full bg-[#1b2457]/75 px-3 py-1.5 text-[11px] text-white/75 lowercase transition-colors duration-200 outline-none hover:text-white focus-visible:outline-1 focus-visible:outline-white/60 focus-visible:outline-dashed sm:right-9 sm:bottom-7"
        onClick={handleWakeUp}
      >
        {copy.firstVisit.notSleepy}
      </button>
    </div>,
    document.querySelector("[data-laundromat-root]") ?? document.body
  );
}

type CloudProps = {
  x: number;
  width: number;
  color: string;
};

function Cloud(props: CloudProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 90"
      className="absolute bottom-[-3vmin] overflow-visible"
      style={{ left: `${props.x}%`, width: `${props.width}%` }}
    >
      <path
        d={CLOUD_PATH}
        transform={`translate(0 ${SHADOW_OFFSET.cloud})`}
        fill={SHADOW_COLOR}
      />
      <path
        d={CLOUD_PATH}
        fill={props.color}
        stroke={PAPER}
        strokeWidth={5}
        strokeLinejoin="round"
        paintOrder="stroke"
      />
    </svg>
  );
}

type SleepyMoonProps = {
  dozing: boolean;
};

function SleepyMoon(props: SleepyMoonProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className="absolute top-[7%] left-[64%] w-[clamp(120px,24vmin,300px)] overflow-visible"
      style={{
        animation: props.dozing
          ? "lm-gn-doze 7s ease-in-out infinite"
          : undefined,
        transform: props.dozing ? undefined : "rotate(-14deg)",
      }}
    >
      <defs>
        {[
          { id: "lm-gn-shadow-cut", r: 64, dy: SHADOW_OFFSET.moon },
          { id: "lm-gn-paper-cut", r: 64, dy: 0 },
          { id: "lm-gn-moon-cut", r: 70, dy: 0 },
        ].map((cut) => (
          <mask key={cut.id} id={cut.id}>
            <rect x={0} y={0} width={200} height={210} fill="white" />
            <circle cx={150} cy={88 + cut.dy} r={cut.r} fill="black" />
          </mask>
        ))}
      </defs>
      <circle
        cx={100}
        cy={100 + SHADOW_OFFSET.moon}
        r={84}
        fill={SHADOW_COLOR}
        mask="url(#lm-gn-shadow-cut)"
      />
      <circle
        cx={100}
        cy={100}
        r={84}
        fill={PAPER}
        mask="url(#lm-gn-paper-cut)"
      />
      <circle
        cx={100}
        cy={100}
        r={78}
        fill={MOON_COLOR}
        mask="url(#lm-gn-moon-cut)"
      />
      <g fill="none" stroke={FACE_COLOR} strokeWidth={5} strokeLinecap="round">
        <path d="M31 90 Q40 101 50 91" />
        <path d="M60 103 Q69 114 79 104" />
        <path d="M46 126 Q55 134 64 127" />
      </g>
      <ellipse
        cx={33}
        cy={110}
        rx={8}
        ry={5}
        fill={CHEEK_COLOR}
        opacity={0.6}
      />
      <ellipse
        cx={74}
        cy={124}
        rx={8}
        ry={5}
        fill={CHEEK_COLOR}
        opacity={0.6}
      />
    </svg>
  );
}
