"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

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

/** Render the room's tray of toys a visitor can bring in, one button per toy in `TOY_ITEMS`: a row on wider screens, and on phones a button that opens the toys as a named list above it, closing when one is picked or on a tap elsewhere. Toys in `unavailableIds` are greyed out and cannot be picked, and the toy `heldId` floats up while it waits to be put down. */
export function ToyTray(props: ToyTrayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
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
    <div ref={rootRef} className="flex flex-col items-end gap-y-2">
      {props.heldId !== undefined && (
        <p className="bg-[var(--pw-paper)] px-2 py-1 text-[12px] text-[var(--pw-ink)]">
          {props.hint}
        </p>
      )}
      <div
        role="toolbar"
        aria-label={props.label}
        className={cn(
          isOpen ? "flex" : "hidden",
          "flex-col gap-y-1 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] p-1 sm:flex sm:flex-row sm:items-center sm:gap-x-1"
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
            <div key={item.id} className="group/toy relative">
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
            </div>
          );
        })}
      </div>
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
        <ToyBasketIcon className="size-8" />
      </button>
    </div>
  );
}
