"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";

import {
  CLICKABLE_SELECTOR,
  TEXT_SELECTOR,
} from "@/lib/laundromat/cursor-selectors";

type CursorKind = "dot" | "ring" | "beam";

const CURSOR_PAINT = {
  dot: {
    borderColor: "transparent",
    backgroundColor: "var(--lm-ink-hi)",
    boxShadow: "0 0 0 1.5px color-mix(in srgb, var(--lm-bg) 50%, transparent)",
  },
  ring: {
    borderColor: "var(--lm-accent)",
    backgroundColor: "transparent",
    boxShadow: "0 0 0 1px color-mix(in srgb, var(--lm-bg) 33%, transparent)",
  },
  beam: {
    borderColor: "transparent",
    backgroundColor: "var(--lm-ink-pen)",
    boxShadow:
      "0 0 0 1.2px color-mix(in srgb, var(--lm-ink-hi) 60%, transparent)",
  },
};

const SHAPES = {
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    borderWidth: 0,
  },
  ring: {
    width: 17,
    height: 17,
    borderRadius: 999,
    borderWidth: 1.1,
  },
  beam: {
    width: 1.5,
    height: 18,
    borderRadius: 1,
    borderWidth: 0,
  },
} satisfies { [kind in CursorKind]: object };

const MORPH_SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.6,
} as const;
const PRESSED_SCALE = 0.82;

function getCursorKind(target: EventTarget | null): CursorKind {
  if (!(target instanceof Element)) return "dot";
  if (target.closest(TEXT_SELECTOR) !== null) return "beam";
  if (target.closest(CLICKABLE_SELECTOR) !== null) return "ring";
  return "dot";
}

/** Draw the laundromat's cursor on fine pointers, following the pointer exactly and morphing between a dot, a ring over anything clickable and a thin line over text, while the native cursor is hidden. */
export function LaundromatCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [kind, setKind] = useState<CursorKind>("dot");
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const root = ref.current?.closest("[data-laundromat-root]");
    if (!root || !window.matchMedia("(pointer: fine)").matches) return;
    root.setAttribute("data-lm-cursor", "");
    setIsActive(true);
    function handleMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setIsVisible(true);
      setKind(getCursorKind(event.target));
    }
    function handleDown() {
      setIsPressed(true);
    }
    function handleUp() {
      setIsPressed(false);
    }
    function handleOut(event: PointerEvent) {
      if (event.relatedTarget === null) setIsVisible(false);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointerout", handleOut);
    return () => {
      root.removeAttribute("data-lm-cursor");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointerout", handleOut);
    };
  }, [x, y]);

  const transition = prefersReducedMotion ? { duration: 0 } : MORPH_SPRING;

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[1000]"
      style={{ x, y }}
    >
      {isActive && (
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-solid transition-[background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none"
          style={CURSOR_PAINT[kind]}
          initial={false}
          animate={{
            ...SHAPES[kind],
            opacity: isVisible ? 1 : 0,
            scale: isPressed ? PRESSED_SCALE : 1,
          }}
          transition={transition}
        >
          <motion.span
            className="block size-[3.6px] rounded-full"
            style={{ backgroundColor: "var(--lm-accent)" }}
            initial={false}
            animate={{
              scale: kind === "ring" ? 1 : 0,
              opacity: kind === "ring" ? 1 : 0,
            }}
            transition={transition}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
