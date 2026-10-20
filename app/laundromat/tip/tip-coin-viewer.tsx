"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { COIN_LIGHT } from "@/lib/laundromat/tip/coin-light";
import { formatTipDate } from "@/lib/laundromat/tip/format-tip-date";
import { getCoinRimText } from "@/lib/laundromat/tip/get-coin-rim-text";
import { getCoinTones } from "@/lib/laundromat/tip/get-coin-tones";
import type { TipToken } from "@/lib/laundromat/tip/tip-token";

import { TipCoinBlank } from "./tip-coin-blank";

const METAL = "brass";
const COIN_SIZE_PX = 280;
const THICKNESS_PX = 16;
const EDGE_LAYERS = 14;
const DEG_PER_PX = { turn: 0.6, tilt: 0.35 };
const MAX_TILT_DEG = 35;
const TAP_SLOP_PX = 4;
const PROJECT_S = 0.18;
const ENTRY_TURN_DEG = -540;
const SETTLE_SPRING = { type: "spring", stiffness: 110, damping: 17 } as const;
const ENTRY_SPRING = { type: "spring", duration: 1.4, bounce: 0.12 } as const;
const SHEEN_SWING_PERCENT = 70;

function nearestFaceDeg(deg: number) {
  return Math.round(deg / 180) * 180;
}

type TipCoinViewerProps = { token: TipToken };

/** Show `token` as a large coin that turns in 3D: its number on the front, and on the back a "thank you" engraving with the token's code and date. Dragging turns it, a tap or an arrow key turns it over, and it always settles on a face; the lettering is lit metal on full quality. */
export function TipCoinViewer(props: TipCoinViewerProps) {
  const { copy } = useLaundromatCopy();
  const { token } = props;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { quality } = useRenderQuality();
  const isRich = quality === "full" && !prefersReducedMotion;
  const rotateY = useMotionValue(isRich ? ENTRY_TURN_DEG : 0);
  const rotateX = useMotionValue(0);
  const stageRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    turnDeg: number;
    tiltDeg: number;
    moved: boolean;
  }>(undefined);
  const { ring } = getCoinTones(METAL);
  const hasRelief = quality === "full";
  const lightsRef = useRef<Element[]>([]);
  const rimText = getCoinRimText({
    siteName: copy.site.name,
    thanks: copy.tip.coinRim,
  });

  useMotionValueEvent(rotateY, "change", (deg) => {
    const stage = stageRef.current;
    if (stage === null) return;
    const radians = (deg * Math.PI) / 180;
    stage.style.setProperty(
      "--sheen-x",
      `${50 + Math.sin(radians) * SHEEN_SWING_PERCENT}%`
    );
    const azimuthDeg = COIN_LIGHT.azimuthDeg + deg - nearestFaceDeg(deg);
    lightsRef.current.forEach((light) => {
      light.setAttribute("azimuth", String(azimuthDeg));
    });
  });

  useEffect(() => {
    lightsRef.current = hasRelief
      ? Array.from(
          stageRef.current?.querySelectorAll("[data-coin-light]") ?? []
        )
      : [];
  }, [hasRelief]);

  useEffect(() => {
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isRich) return;
    const controls = animate(rotateY, 0, ENTRY_SPRING);
    return () => controls.stop();
  }, [isRich, rotateY]);

  function settle(options: { turnDeg: number; velocity: number }) {
    if (prefersReducedMotion) {
      rotateY.set(options.turnDeg);
      rotateX.set(0);
      return;
    }
    animate(rotateY, options.turnDeg, {
      ...SETTLE_SPRING,
      velocity: options.velocity,
    });
    animate(rotateX, 0, SETTLE_SPRING);
  }

  function turnOver(direction: 1 | -1) {
    settle({
      turnDeg: nearestFaceDeg(rotateY.get()) + 180 * direction,
      velocity: 0,
    });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    rotateY.stop();
    rotateX.stop();
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      turnDeg: rotateY.get(),
      tiltDeg: rotateX.get(),
      moved: false,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (drag === undefined || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > TAP_SLOP_PX) drag.moved = true;
    rotateY.set(drag.turnDeg + dx * DEG_PER_PX.turn);
    rotateX.set(
      Math.max(
        -MAX_TILT_DEG,
        Math.min(MAX_TILT_DEG, drag.tiltDeg - dy * DEG_PER_PX.tilt)
      )
    );
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (drag === undefined || drag.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    if (!drag.moved) {
      turnOver(1);
      return;
    }
    const velocity = rotateY.getVelocity();
    settle({
      turnDeg: nearestFaceDeg(rotateY.get() + velocity * PROJECT_S),
      velocity,
    });
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    settle({ turnDeg: nearestFaceDeg(rotateY.get()), velocity: 0 });
  }

  const faceClass = "absolute inset-0 [backface-visibility:hidden]";
  const sheen = isRich ? "track" : "static";
  return (
    <div className="flex justify-center px-3 pt-2 pb-6">
      <button
        ref={stageRef}
        type="button"
        aria-label={copy.tip.turnCoin}
        className="relative grid cursor-grab touch-none place-items-center rounded-full outline-none select-none [perspective:900px] focus-visible:shadow-[0_0_0_2px_var(--lm-panel),0_0_0_3.5px_var(--lm-accent)] active:cursor-grabbing"
        style={{ width: COIN_SIZE_PX, height: COIN_SIZE_PX }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={(event) => {
          if (event.detail === 0) turnOver(1);
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          turnOver(event.key === "ArrowLeft" ? -1 : 1);
        }}
      >
        <span
          aria-hidden
          className="absolute inset-x-[12%] -bottom-[10%] h-[16%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.6),transparent)]"
        />
        <motion.span
          aria-hidden
          className="relative block size-full [transform-style:preserve-3d]"
          style={{ rotateX, rotateY }}
        >
          {Array.from({ length: EDGE_LAYERS }, (_, index) => (
            <span
              key={index}
              className="absolute inset-[0.5%] rounded-full"
              style={{
                background: index % 2 === 0 ? ring.dark : ring.edge,
                transform: `translateZ(${-THICKNESS_PX / 2 + ((index + 0.5) * THICKNESS_PX) / EDGE_LAYERS}px)`,
              }}
            />
          ))}
          <span
            className={faceClass}
            style={{ transform: `translateZ(${THICKNESS_PX / 2}px)` }}
          >
            <TipCoinBlank
              metal={METAL}
              sizePx={COIN_SIZE_PX}
              rimText={rimText}
              relief={hasRelief}
              sheen={sheen}
              raised={false}
            >
              {({ field, raiseFilter }) => (
                <g
                  className="font-[family-name:var(--lm-font-display)]"
                  textAnchor="middle"
                  fill={raiseFilter === undefined ? field.edge : field.base}
                  filter={raiseFilter}
                >
                  <text x={50} y={36} fontSize={9}>
                    {copy.tip.coinNumberCaption}
                  </text>
                  <text
                    x={50}
                    y={66}
                    fontSize={String(token.number).length > 2 ? 30 : 36}
                    fontWeight={600}
                  >
                    {token.number}
                  </text>
                </g>
              )}
            </TipCoinBlank>
          </span>
          <span
            className={faceClass}
            style={{
              transform: `rotateY(180deg) translateZ(${THICKNESS_PX / 2}px)`,
            }}
          >
            <TipCoinBlank
              metal={METAL}
              sizePx={COIN_SIZE_PX}
              rimText={undefined}
              relief={hasRelief}
              sheen={sheen}
              raised={false}
            >
              {({ field, cutFilter, fineCutFilter }) => (
                <g
                  textAnchor="middle"
                  fill={cutFilter === undefined ? field.edge : field.base}
                >
                  <text
                    x={50}
                    y={32}
                    className="font-[family-name:var(--lm-font-mono)] uppercase"
                    fontSize={4.4}
                    letterSpacing={0.9}
                    filter={fineCutFilter}
                  >
                    {copy.site.name}
                  </text>
                  <text
                    x={50}
                    y={52}
                    className="font-[family-name:var(--lm-font-display)]"
                    fontSize={15}
                    filter={cutFilter}
                  >
                    {copy.tip.coinBackNote}
                  </text>
                  <rect
                    x={36}
                    y={58.6}
                    width={28}
                    height={0.8}
                    rx={0.4}
                    filter={cutFilter}
                  />
                  <text
                    x={50}
                    y={68}
                    fill={field.edge}
                    className="font-[family-name:var(--lm-font-mono)]"
                    fontSize={5}
                    fontWeight={600}
                    textLength={56}
                    lengthAdjust="spacingAndGlyphs"
                    filter={fineCutFilter}
                  >
                    {token.code}
                  </text>
                  <text
                    x={50}
                    y={75.5}
                    fill={field.dark}
                    className="font-[family-name:var(--lm-font-mono)] lowercase"
                    fontSize={4}
                    filter={fineCutFilter}
                  >
                    {formatTipDate({
                      isoDate: token.createdAt,
                      locale: copy.locale,
                    })}
                  </text>
                </g>
              )}
            </TipCoinBlank>
          </span>
        </motion.span>
      </button>
    </div>
  );
}
