"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { TOY_ITEMS, type ToyItemId } from "@/lib/paws/sim/toy-items";
import { cn } from "@/lib/utils";

import { ToyBasketIcon } from "./toy-basket-icon";
import { ToyIcon } from "./toy-icon";

type ToyTrayProps = {
  label: string;
  rollLabel: string;
  yarnLabel: string;
  inRoomLabel: string;
  hint: string;
  unavailableIds: ToyItemId[];
  heldId: ToyItemId | undefined;
  onPress: (press: {
    itemId: ToyItemId;
    event: React.PointerEvent<HTMLButtonElement>;
  }) => void;
  onKeyPick: (itemId: ToyItemId) => void;
};

const RISE_LIST: Variants = {
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    visibility: "visible",
    transition: {
      type: "spring",
      stiffness: 520,
      damping: 36,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  closed: {
    opacity: 0,
    scale: 0.92,
    y: 12,
    transition: { duration: 0.16, ease: "easeIn" },
    transitionEnd: { visibility: "hidden" },
  },
};

const RISE_ITEM: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 600, damping: 34 },
  },
  closed: { opacity: 0, y: 10, transition: { duration: 0.1 } },
};

const FADE_LIST: Variants = {
  open: { opacity: 1, visibility: "visible", transition: { duration: 0.12 } },
  closed: {
    opacity: 0,
    transition: { duration: 0.12 },
    transitionEnd: { visibility: "hidden" },
  },
};

const FADE_ITEM: Variants = { open: { opacity: 1 }, closed: { opacity: 1 } };

/** Render the room's tray of toys a visitor can bring in, one button per toy in `TOY_ITEMS`: a row on wider screens, and on phones a basket button that empties as the toys rise out of it into a named list above, which closes when one is picked or on a tap elsewhere. Toys in `unavailableIds` are greyed out and cannot be picked, and the toy `heldId` floats up while it waits to be put down. */
export function ToyTray(props: ToyTrayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion() ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const [seenHeldId, setSeenHeldId] = useState(props.heldId);
  if (props.heldId !== seenHeldId) {
    setSeenHeldId(props.heldId);
    if (props.heldId !== undefined) setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (
        root !== null &&
        event.target instanceof Node &&
        root.contains(event.target)
      )
        return;
      setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function handleToggle() {
    setIsOpen(!isOpen);
  }

  return (
    <div ref={rootRef} className="relative flex flex-col items-end gap-y-2">
      {props.heldId !== undefined && (
        <p className="bg-[var(--pw-paper)] px-2 py-1 text-[12px] text-[var(--pw-ink)]">
          {props.hint}
        </p>
      )}
      <motion.div
        role="toolbar"
        aria-label={props.label}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={isReduced ? FADE_LIST : RISE_LIST}
        style={{ transformOrigin: "bottom right" }}
        className={cn(
          "absolute right-0 bottom-full mb-2 flex flex-col gap-y-1 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] p-1",
          !isOpen && "pointer-events-none",
          "sm:pointer-events-auto sm:!visible sm:static sm:mb-0 sm:!transform-none sm:flex-row sm:items-center sm:gap-x-1 sm:!opacity-100"
        )}
      >
        {TOY_ITEMS.map((item) => {
          const isUnavailable = props.unavailableIds.includes(item.id);
          const isHeld = props.heldId === item.id;
          const name = item.kind === "roll" ? props.rollLabel : props.yarnLabel;
          function handlePointerDown(
            event: React.PointerEvent<HTMLButtonElement>
          ) {
            props.onPress({ itemId: item.id, event });
          }
          function handleKeyDown(event: React.KeyboardEvent) {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            props.onKeyPick(item.id);
          }
          return (
            <motion.div
              key={item.id}
              variants={isReduced ? FADE_ITEM : RISE_ITEM}
              className="group/toy relative sm:!transform-none sm:!opacity-100"
            >
              <button
                type="button"
                disabled={isUnavailable}
                aria-pressed={isHeld}
                aria-label={
                  isUnavailable ? `${name}, ${props.inRoomLabel}` : name
                }
                onPointerDown={handlePointerDown}
                onKeyDown={handleKeyDown}
                className={cn(
                  FOCUS_RING_CLASS,
                  "flex h-10 w-full touch-none items-center gap-x-2 pr-3 pl-1.5 text-[13px] text-[var(--pw-ink)] transition-transform duration-150 sm:size-8 sm:justify-center sm:p-0",
                  "hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0",
                  isHeld &&
                    "-translate-y-2 scale-125 drop-shadow-[0_3px_2px_rgba(43,58,99,0.35)]"
                )}
              >
                <ToyIcon itemId={item.id} className="size-7 sm:size-6" />
                <span aria-hidden className="whitespace-nowrap sm:hidden">
                  {name}
                  {isUnavailable && (
                    <span className="text-[var(--pw-ink-soft)]">
                      {" · "}
                      {props.inRoomLabel}
                    </span>
                  )}
                </span>
              </button>
              {!isHeld && (
                <span
                  aria-hidden
                  className="pointer-events-none invisible absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 border border-[var(--pw-ink)] bg-[var(--pw-paper)] px-2 py-0.5 text-[12px] whitespace-nowrap text-[var(--pw-ink)] group-focus-within/toy:visible sm:block [@media(hover:hover)]:group-hover/toy:visible"
                >
                  {name}
                  {isUnavailable && (
                    <span className="text-[var(--pw-ink-soft)]">
                      {" · "}
                      {props.inRoomLabel}
                    </span>
                  )}
                </span>
              )}
            </motion.div>
          );
        })}
      </motion.div>
      <button
        type="button"
        aria-label={props.label}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={cn(
          FOCUS_RING_CLASS,
          "grid size-11 place-items-center border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[var(--pw-ink)] sm:hidden",
          isOpen && "bg-[var(--pw-paper-deep)]"
        )}
      >
        <ToyBasketIcon className="size-8" empty={isOpen} />
      </button>
    </div>
  );
}
