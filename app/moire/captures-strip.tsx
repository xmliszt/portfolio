"use client";

import { motion } from "motion/react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { HOVER } from "./hover";
import { MoireRecord, recordUrl } from "./moire-data";

type CapturesStripProps = {
  captures: MoireRecord[];
  /** Drives the entrance with the rest of the page's storyboard. */
  visible: boolean;
  delay: number;
};

/* Entrance: each thumbnail rises into place, 60ms behind the one before it. */
const ENTRANCE = {
  stagger: 0.06,
  offsetY: 12,
  spring: { type: "spring" as const, stiffness: 350, damping: 28 },
};

/** Room inside the clipped scroll viewport for the lift and its shadow. */
const LIFT_HEADROOM = "pt-3 pb-5";

export function CapturesStrip(props: CapturesStripProps) {
  return (
    <ScrollArea className="relative -mx-8 w-[calc(100%+4rem)]">
      <div className={cn("flex gap-x-3 px-8", LIFT_HEADROOM)}>
        {props.captures.map((record, index) => (
          <motion.a
            key={record.id}
            href={recordUrl(record)}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: ENTRANCE.offsetY }}
            animate={{
              opacity: props.visible ? 1 : 0,
              y: props.visible ? 0 : ENTRANCE.offsetY,
            }}
            transition={{
              ...ENTRANCE.spring,
              delay: props.delay + index * ENTRANCE.stagger,
            }}
            className="group w-28 shrink-0 sm:w-32"
          >
            {/* Separate element so the hover transform never fights the
                entrance transform Motion is already writing on the anchor. */}
            <motion.div
              initial={HOVER.rest}
              whileHover={HOVER.lift}
              whileTap={HOVER.press}
              transition={HOVER.spring}
              className={cn(
                "overflow-hidden rounded-lg border",
                "transition-shadow duration-300 ease-out group-hover:shadow-lg"
              )}
            >
              <img
                src={record.imageUrl ?? ""}
                alt=""
                loading="lazy"
                className="m-0 aspect-square w-full object-cover"
              />
            </motion.div>
            <span
              className={cn(
                "text-muted-foreground group-hover:text-foreground",
                "mt-2 line-clamp-2 min-h-[2lh] text-[11px] leading-snug",
                "transition-colors duration-300 ease-out"
              )}
            >
              {record.label}
            </span>
          </motion.a>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="sr-only" />
      {/* Edge fades, matching the craft station links. */}
      <div className="from-background pointer-events-none absolute top-0 left-0 h-full w-8 bg-gradient-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l to-transparent" />
    </ScrollArea>
  );
}
