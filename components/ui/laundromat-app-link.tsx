"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { FlyOutTooltip } from "@/components/ui/fly-out-tooltip";
import { createSoundBoard } from "@/lib/laundromat/audio/create-sound-board";
import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { cn } from "@/lib/utils";

import { LaundromatDoor } from "./laundromat-door";

type LaundromatAppLinkProps = {
  children: React.ReactNode;
};

/** Link to laundro.cafe that plays a washer running while hovered and shows a half-open door glowing with warm light. */
export function LaundromatAppLink(props: LaundromatAppLinkProps) {
  const boardRef = useRef<ReturnType<typeof createSoundBoard>>(undefined);

  useEffect(() => {
    const board = createSoundBoard({
      fetchIndex: async () => ["washer-running"],
    });
    boardRef.current = board;
    return () => {
      board.dispose();
      boardRef.current = undefined;
    };
  }, []);

  function handlePointerEnter(event: React.PointerEvent) {
    const board = boardRef.current;
    if (event.pointerType === "touch" || !board) return;
    board.startLoop("washer-running");
    void board.resume();
  }

  function handlePointerLeave() {
    boardRef.current?.stopLoop("washer-running");
  }

  return (
    <FlyOutTooltip label="Laundro Cafe" content={<LaundromatDoor />}>
      <span
        className="group relative m-0 inline-block w-fit"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <Link
          href={LAUNDROMAT_ORIGIN}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            "font-normal no-underline transition-colors [&>p]:m-0"
          )}
          target="_self"
        >
          {props.children}
        </Link>
        <span
          className={cn(
            "bg-foreground absolute bottom-0 left-0 rounded-full",
            "h-0 w-0 opacity-0 transition-[opacity_width] duration-300 group-hover:h-px group-hover:w-full group-hover:opacity-100"
          )}
        ></span>
      </span>
    </FlyOutTooltip>
  );
}
