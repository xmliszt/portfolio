"use client";

import type React from "react";

import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { TOY_ITEMS, type ToyItemId } from "@/lib/paws/sim/toy-items";
import { cn } from "@/lib/utils";

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

/** Render the room's tray of toys a visitor can bring in, one button per toy in `TOY_ITEMS`: those in `unavailableIds` are greyed out and cannot be picked, and the toy `heldId` floats up while it waits to be put down. */
export function ToyTray(props: ToyTrayProps) {
  return (
    <div className="flex flex-col items-end gap-y-2">
      {props.heldId !== undefined && (
        <p className="bg-[var(--pw-paper)] px-2 py-1 text-[12px] text-[var(--pw-ink)]">
          {props.hint}
        </p>
      )}
      <div
        role="toolbar"
        aria-label={props.label}
        className="flex items-center gap-x-1 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] p-1"
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
                  "grid size-10 touch-none place-items-center transition-transform duration-150 sm:size-8",
                  "hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0",
                  isHeld &&
                    "-translate-y-2 scale-125 drop-shadow-[0_3px_2px_rgba(43,58,99,0.35)]"
                )}
              >
                <ToyIcon itemId={item.id} className="size-7 sm:size-6" />
              </button>
              {!isHeld && (
                <span
                  aria-hidden
                  className="pointer-events-none invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 border border-[var(--pw-ink)] bg-[var(--pw-paper)] px-2 py-0.5 text-[12px] whitespace-nowrap text-[var(--pw-ink)] group-focus-within/toy:visible [@media(hover:hover)]:group-hover/toy:visible"
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
    </div>
  );
}
