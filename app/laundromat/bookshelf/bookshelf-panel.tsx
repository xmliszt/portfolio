"use client";

import { motion } from "motion/react";

import {
  COIN_PANEL_GUTTER_PX,
  COIN_PANEL_WIDTH_PX,
} from "@/app/laundromat/tip/coin-machine-sheet";
import { TIP_PANEL_CLASS } from "@/app/laundromat/tip/tip-classes";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;
const SLIDE_S = 0.32;
const PANEL_OFFSET_PX = 24;

type BookshelfPanelProps = {
  narrow: boolean;
  reducedMotion: boolean;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** Hold a bookshelf card or form beside the zoomed-in shelf: a panel at the right edge on wide screens, a bottom sheet on phones. */
export function BookshelfPanel(props: BookshelfPanelProps) {
  const offset = props.reducedMotion
    ? {}
    : props.narrow
      ? { y: "100%" }
      : { x: PANEL_OFFSET_PX };
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    props.onClose();
  }
  const panel = (
    <motion.div
      role="dialog"
      aria-label={props.label}
      data-bookshelf-panel
      data-bookshelf-overlay
      onKeyDown={handleKeyDown}
      className={cn(
        TIP_PANEL_CLASS,
        "pointer-events-auto relative overflow-hidden",
        props.narrow
          ? "absolute inset-x-0 bottom-0 z-40 max-h-[56dvh] rounded-t-[22px] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          : "max-h-[calc(100dvh-40px)] rounded-[22px]"
      )}
      style={props.narrow ? undefined : { width: COIN_PANEL_WIDTH_PX }}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offset }}
      transition={{ duration: SLIDE_S, ease: EASE }}
    >
      {props.children}
    </motion.div>
  );
  if (props.narrow) return panel;
  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-40 flex items-center"
      style={{
        right: `max(${COIN_PANEL_GUTTER_PX}px, env(safe-area-inset-right))`,
      }}
    >
      {panel}
    </div>
  );
}
