"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";

import { createAutumnPlanet } from "./autumn-planet-scene";

const CLICK_SLOP_PX = 6;
const CORNER_RADIUS_PX = 32;
const TRANSITION = { type: "spring", bounce: 0.12, duration: 0.6 } as const;

export function AutumnPlanetContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<{ x: number; y: number }>(undefined);
  const viewRef = useRef({ active: false });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return createAutumnPlanet(container, { view: viewRef.current });
  }, []);

  useEffect(() => {
    viewRef.current.active = isFullscreen;
    if (!isFullscreen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") exitFullscreen();
    }
    const scroller = document.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    const previousOverflow = scroller?.style.overflow;
    if (scroller) scroller.style.overflow = "hidden";
    addEventListener("keydown", handleKeyDown);
    return () => {
      if (scroller) scroller.style.overflow = previousOverflow ?? "";
      removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  function exitFullscreen() {
    containerRef.current?.querySelector("canvas")?.blur();
    setIsFullscreen(false);
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return;
    pressRef.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent) {
    const press = pressRef.current;
    pressRef.current = undefined;
    if (isFullscreen || !press) return;
    const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    if (moved < CLICK_SLOP_PX) setIsFullscreen(true);
  }

  return (
    <div className="relative mt-4 h-[560px] w-full">
      <motion.div
        layoutId="cat-planet-scene"
        transition={TRANSITION}
        className={
          isFullscreen
            ? "fixed inset-0 z-[100] overflow-hidden"
            : "absolute inset-0 overflow-hidden"
        }
        style={{ borderRadius: isFullscreen ? 0 : CORNER_RADIUS_PX }}
      >
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="size-full"
        />
      </motion.div>
      <AnimatePresence>
        {isFullscreen && (
          <motion.button
            type="button"
            aria-label="Exit full screen"
            onClick={exitFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.35 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="bg-background/80 text-foreground hover:bg-background focus-visible:ring-ring fixed z-[101] flex size-10 items-center justify-center rounded-full shadow-md backdrop-blur focus-visible:ring-2 focus-visible:outline-none"
            style={{
              top: "calc(16px + env(safe-area-inset-top, 0px))",
              right: "calc(16px + env(safe-area-inset-right, 0px))",
            }}
          >
            <X size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
