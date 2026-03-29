"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const VIDEO_SRC = "/palm-shadow.mp4";
const CROSSFADE_S = 2.2; // cross-fade duration in seconds
const TRIGGER_BEFORE_END_S = 3.5; // start cross-fade this many seconds before end

// ─── Time-of-day keyframes ─────────────────────────────────────────────────
// h: hour 0–24  |  o: shadow opacity  |  s: sepia  |  sat: saturate  |  br: brightness
const KF = [
  { h: 0, o: 0.01, s: 0, sat: 0.7, br: 0.8 },
  { h: 4, o: 0.049, s: 0, sat: 0.65, br: 0.75 },
  { h: 6, o: 0.255, s: 0, sat: 0.95, br: 0.97 },
  { h: 8, o: 0.436, s: 0, sat: 1.0, br: 1.0 },
  { h: 10, o: 0.487, s: 0, sat: 1.0, br: 1.0 },
  { h: 12, o: 0.5, s: 0, sat: 1.0, br: 1.0 },
  { h: 15, o: 0.423, s: 0, sat: 1.0, br: 1.0 },
  { h: 17, o: 0.345, s: 0, sat: 1.0, br: 1.05 },
  { h: 19, o: 0.294, s: 0, sat: 1.0, br: 0.95 },
  { h: 21, o: 0.126, s: 0, sat: 0.75, br: 0.88 },
  { h: 23, o: 0.081, s: 0, sat: 0.7, br: 0.82 },
  { h: 24, o: 0.01, s: 0, sat: 0.7, br: 0.8 },
];

function drawCover(
  ctx: CanvasRenderingContext2D,
  vid: HTMLVideoElement,
  W: number,
  H: number
) {
  const vw = vid.videoWidth || W;
  const vh = vid.videoHeight || H;
  const scale = Math.max(W / vw, H / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;
  ctx.drawImage(vid, dx, dy, dw, dh);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getTargetValues(h: number) {
  let prev = KF[0],
    next = KF[KF.length - 1];
  for (let i = 0; i < KF.length - 1; i++) {
    if (h >= KF[i].h && h < KF[i + 1].h) {
      prev = KF[i];
      next = KF[i + 1];
      break;
    }
  }
  const t = easeInOut(
    Math.max(0, Math.min(1, (h - prev.h) / (next.h - prev.h)))
  );
  return {
    opacity: lerp(prev.o, next.o, t),
    sepia: lerp(prev.s, next.s, t),
    saturation: lerp(prev.sat, next.sat, t),
    brightness: lerp(prev.br, next.br, t),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PalmShadowBackground() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep a ref so the RAF closure always reads the latest theme without re-running the effect
  const themeRef = useRef(resolvedTheme);
  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Two hidden video elements — never added to the DOM
    function makeVid() {
      const v = document.createElement("video");
      v.src = VIDEO_SRC;
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      return v;
    }
    const vidA = makeVid();
    const vidB = makeVid();

    // ── All animation state lives here — zero React re-renders ───────────────
    const s = {
      W: window.innerWidth,
      H: window.innerHeight,
      prevTime: performance.now(),
      // cross-fade
      isCrossFading: false,
      crossFadeStartTime: 0,
      crossFadingToB: true, // true → A→B, false → B→A
      // animated values (lerped each frame)
      opacity: 0,
      sepia: 0,
      saturation: 1,
      brightness: 1,
    };

    function resize() {
      s.W = window.innerWidth;
      s.H = window.innerHeight;
      canvas!.width = s.W;
      canvas!.height = s.H;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Cross-fade helpers ────────────────────────────────────────────────────
    let cleanupWatch = () => {};

    function watchForEnd(
      primary: HTMLVideoElement,
      secondary: HTMLVideoElement,
      toB: boolean
    ) {
      function trigger() {
        if (s.isCrossFading) return;
        s.isCrossFading = true;
        s.crossFadingToB = toB;
        s.crossFadeStartTime = performance.now();
        secondary.currentTime = 0;
        secondary.play().catch(() => {});
        primary.removeEventListener("timeupdate", onTU);
        primary.removeEventListener("ended", onEnded);
      }
      function onTU() {
        if (!primary.duration) return;
        if (primary.duration - primary.currentTime <= TRIGGER_BEFORE_END_S)
          trigger();
      }
      // Fallback: if timeupdate missed the window, snap-start mid-crossfade
      function onEnded() {
        if (s.isCrossFading) return;
        s.isCrossFading = true;
        s.crossFadingToB = toB;
        s.crossFadeStartTime = performance.now() - (CROSSFADE_S * 1000) / 2;
        secondary.currentTime = 0;
        secondary.play().catch(() => {});
        primary.removeEventListener("timeupdate", onTU);
        primary.removeEventListener("ended", onEnded);
      }
      primary.addEventListener("timeupdate", onTU);
      primary.addEventListener("ended", onEnded);
      return () => {
        primary.removeEventListener("timeupdate", onTU);
        primary.removeEventListener("ended", onEnded);
      };
    }

    // ── RAF loop ──────────────────────────────────────────────────────────────
    let rafId: number;

    function frame(now: number) {
      rafId = requestAnimationFrame(frame);

      const dt = Math.min((now - s.prevTime) / 1000, 0.1);
      s.prevTime = now;

      // --- Target values from current time + theme ---
      const d = new Date();
      const hour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
      const tgt = getTargetValues(hour);
      const isLight = themeRef.current === "light";
      const targetOpacity = isLight ? tgt.opacity : 0;

      // --- Lerp animated values ---
      // Opacity: half-life 1s → snappy theme switch + smooth time-of-day changes
      const ol = 1 - Math.pow(0.5, dt / 1.0);
      s.opacity += (targetOpacity - s.opacity) * ol;

      // Color: half-life 45s → imperceptibly gradual warmth shift
      const cl = 1 - Math.pow(0.5, dt / 45);
      s.sepia += (tgt.sepia - s.sepia) * cl;
      s.saturation += (tgt.saturation - s.saturation) * cl;
      s.brightness += (tgt.brightness - s.brightness) * cl;

      // Update canvas CSS filter (same element as mix-blend-mode = valid per spec)
      const fp: string[] = [];
      if (s.sepia > 0.004) fp.push(`sepia(${s.sepia.toFixed(3)})`);
      if (Math.abs(s.saturation - 1) > 0.004)
        fp.push(`saturate(${s.saturation.toFixed(3)})`);
      if (Math.abs(s.brightness - 1) > 0.004)
        fp.push(`brightness(${s.brightness.toFixed(3)})`);
      canvas!.style.filter = fp.length ? fp.join(" ") : "";

      // --- Cross-fade alpha split ---
      let alphaA = s.opacity;
      let alphaB = 0;

      if (s.isCrossFading) {
        const elapsed = (now - s.crossFadeStartTime) / 1000;
        const progress = Math.min(elapsed / CROSSFADE_S, 1);
        const eased = easeInOut(progress);

        if (s.crossFadingToB) {
          alphaA = s.opacity * (1 - eased); // A fades out
          alphaB = s.opacity * eased; //       B fades in
        } else {
          alphaA = s.opacity * eased; //       A fades in
          alphaB = s.opacity * (1 - eased); // B fades out
        }

        if (progress >= 1) {
          s.isCrossFading = false;
          cleanupWatch();
          if (s.crossFadingToB) {
            vidA.pause();
            cleanupWatch = watchForEnd(vidB, vidA, false);
          } else {
            vidB.pause();
            cleanupWatch = watchForEnd(vidA, vidB, true);
          }
        }
      }

      // --- Draw ---
      const { W, H } = s;
      if (!ctx) return;
      // White fill — with multiply blend, white × backdrop = backdrop (invisible)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      if (alphaA > 0.004 && vidA.readyState >= 2) {
        ctx.globalAlpha = Math.min(alphaA, 1);
        drawCover(ctx, vidA, W, H);
      }
      if (alphaB > 0.004 && vidB.readyState >= 2) {
        ctx.globalAlpha = Math.min(alphaB, 1);
        drawCover(ctx, vidB, W, H);
      }
      ctx.globalAlpha = 1;
    }

    // Start playback
    vidA
      .play()
      .then(() => {
        cleanupWatch = watchForEnd(vidA, vidB, true);
      })
      .catch(() => {});

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      cleanupWatch();
      window.removeEventListener("resize", resize);
      vidA.pause();
      vidA.src = "";
      vidB.pause();
      vidB.src = "";
    };
  }, []); // intentionally run once — themeRef stays in sync via its own effect

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{
        zIndex: 1,
        mixBlendMode: "multiply",
      }}
    />
  );
}
