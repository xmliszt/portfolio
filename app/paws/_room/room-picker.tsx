"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { getRoomNumber } from "@/lib/paws/rooms/get-room-number";
import { parseListRoomsResponse } from "@/lib/paws/rooms/parse-list-rooms-response";
import type { RoomSummary } from "@/lib/paws/rooms/room-api-types";
import { cn } from "@/lib/utils";

import { postRoomApi } from "./post-room-api";

const COPIED_MS = 1800;

type RoomPickerProps = {
  roomId: string;
  accessToken: string;
  isPlayer: boolean;
  onSwitch: (roomId: string) => void;
};

function PawIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="currentColor">
      <ellipse cx="6" cy="8" rx="2.6" ry="2.2" />
      <circle cx="2.4" cy="5" r="1.1" />
      <circle cx="4.6" cy="2.9" r="1.1" />
      <circle cx="7.4" cy="2.9" r="1.1" />
      <circle cx="9.6" cy="5" r="1.1" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <path d="M1 6c1.4-2.4 3.1-3.5 5-3.5S9.6 3.6 11 6c-1.4 2.4-3.1 3.5-5 3.5S2.4 8.4 1 6z" />
      <circle cx="6" cy="6" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Let the visitor see the open rooms with their cats and guests, switch to one with space, and copy a link to their own room. */
export function RoomPicker(props: RoomPickerProps) {
  const { copy } = usePawsCopy();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isReduced = useReducedMotion() ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomSummary[] | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const shown = (() => {
    const listed = rooms ?? [];
    return listed.some((room) => room.roomId === props.roomId)
      ? listed
      : [
          {
            roomId: props.roomId,
            players: props.isPlayer ? 1 : 0,
            watchers: props.isPlayer ? 0 : 1,
          },
          ...listed,
        ];
  })();
  const limit = props.isPlayer
    ? ROOM_LIMITS.maxPlayers
    : ROOM_LIMITS.maxWatchers;
  const isFull = (room: RoomSummary) =>
    room.roomId !== props.roomId &&
    (props.isPlayer ? room.players : room.watchers) >= limit;
  const nameOf = (roomId: string) =>
    copy.room.roomName.replace("{number}", String(getRoomNumber(roomId)));

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    void postRoomApi({
      path: "list",
      accessToken: props.accessToken,
      body: {},
    }).then((answer) => {
      if (!controller.signal.aborted)
        setRooms(parseListRoomsResponse(answer) ?? []);
    });
    listRef.current?.focus();
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      controller.abort();
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, props.accessToken]);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  function close() {
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function pick(index: number) {
    const room = shown[index];
    if (room === undefined || isFull(room)) return;
    if (room.roomId !== props.roomId) props.onSwitch(room.roomId);
    close();
  }

  function handleToggle() {
    if (isOpen) {
      close();
      return;
    }
    setActiveIndex(0);
    setIsOpen(true);
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    const last = shown.length - 1;
    const moves: { [key: string]: number | undefined } = {
      ArrowDown: Math.min(last, activeIndex + 1),
      ArrowUp: Math.max(0, activeIndex - 1),
      Home: 0,
      End: last,
    };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      setActiveIndex(move);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(activeIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  function handlePopoverKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  async function handleCopyLink() {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("room", props.roomId);
    try {
      await navigator.clipboard.writeText(url.toString());
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={`${copy.room.rooms}: ${nameOf(props.roomId)}`}
        onClick={handleToggle}
        className={cn(
          FOCUS_RING_CLASS,
          "flex h-10 cursor-pointer items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] tabular-nums hover:bg-[var(--pw-paper-deep)] sm:h-8"
        )}
      >
        {nameOf(props.roomId)}
        <svg
          aria-hidden
          viewBox="0 0 10 10"
          className={cn(
            "size-2.5 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="currentColor"
        >
          <path d="M1 3l4 4 4-4z" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onKeyDown={handlePopoverKeyDown}
            initial={
              isReduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            style={{ transformOrigin: "100% 0%" }}
            className="absolute top-full right-0 z-20 mt-2 flex w-72 max-w-[calc(100vw-32px)] flex-col border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[12px] text-[var(--pw-ink)] shadow-[3px_2px_0_var(--pw-pink)]"
          >
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-label={copy.room.rooms}
              aria-activedescendant={`${listId}-${activeIndex}`}
              aria-busy={rooms === undefined}
              onKeyDown={handleListKeyDown}
              className="max-h-[min(50dvh,300px)] overflow-y-auto py-1 outline-none [scrollbar-width:thin]"
            >
              {shown.map((room, index) => {
                const isHere = room.roomId === props.roomId;
                return (
                  <li
                    key={room.roomId}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={isHere}
                    aria-disabled={isFull(room)}
                    onPointerMove={() => setActiveIndex(index)}
                    onClick={() => pick(index)}
                    className={cn(
                      "flex items-center gap-x-3 px-3 py-2 tabular-nums sm:py-1.5",
                      index === activeIndex && "bg-[var(--pw-paper-deep)]",
                      isFull(room)
                        ? "cursor-default opacity-50"
                        : "cursor-pointer",
                      isHere && "font-medium"
                    )}
                  >
                    <span className="flex-1 whitespace-nowrap">
                      {nameOf(room.roomId)}
                    </span>
                    <span
                      className="flex items-center gap-x-1"
                      aria-label={copy.room.roomCats.replace(
                        "{count}",
                        String(room.players)
                      )}
                    >
                      <PawIcon />
                      {room.players}
                    </span>
                    <span
                      className="flex items-center gap-x-1 text-[var(--pw-ink-soft)]"
                      aria-label={copy.room.roomGuests.replace(
                        "{count}",
                        String(room.watchers)
                      )}
                    >
                      <EyeIcon />
                      {room.watchers}
                    </span>
                    {isHere && (
                      <span className="bg-[var(--pw-yellow)] px-1 text-[11px]">
                        {copy.room.roomHere}
                      </span>
                    )}
                    {isFull(room) && (
                      <span className="text-[11px] text-[var(--pw-ink-soft)]">
                        {copy.room.roomFull}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className={cn(
                FOCUS_RING_CLASS,
                "border-t-[1.5px] border-[var(--pw-ink)] px-3 py-2 text-left hover:bg-[var(--pw-paper-deep)]"
              )}
            >
              <span role="status" aria-live="polite">
                {isCopied ? copy.room.roomLinkCopied : copy.room.copyRoomLink}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
