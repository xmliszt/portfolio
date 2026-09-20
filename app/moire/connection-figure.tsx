"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { HOVER } from "./hover";
import { MoireConnection, MoireRecord, recordUrl } from "./moire-data";

type ConnectionFigureProps = {
  connection: MoireConnection;
  /** Drives the entrance with the rest of the page's storyboard. */
  visible: boolean;
  delay: number;
};

const SPRING = { type: "spring" as const, stiffness: 350, damping: 28 };

/*
  The relation phrase is the content here — the two records are its evidence.
  So the ends are a fixed, modest size rather than filling the column, and the
  phrase is the largest thing in the figure.
*/
const END_WIDTH = "w-28 sm:w-32";

export function ConnectionFigure(props: ConnectionFigureProps) {
  const [from, to] = props.connection.records;
  if (!from || !to) return null;

  return (
    <motion.figure
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: props.visible ? 1 : 0, y: props.visible ? 0 : 10 }}
      transition={{ ...SPRING, delay: props.delay }}
      className="m-0 flex flex-col items-center gap-y-4"
    >
      <div className="flex items-start justify-center gap-x-3 sm:gap-x-4">
        <ConnectionEnd record={from} />

        {/* The judgment: an arc, because a connection is drawn, not filed. */}
        <svg
          viewBox="0 0 64 40"
          className="text-muted-foreground/60 mt-10 h-7 w-12 shrink-0 sm:w-16"
          aria-hidden
        >
          <path
            d="M5 28 C 20 6, 44 6, 59 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="5" cy="28" r="2.5" fill="currentColor" />
          <circle cx="59" cy="28" r="2.5" fill="currentColor" />
        </svg>

        <ConnectionEnd record={to} />
      </div>

      <figcaption
        className={cn(
          "text-foreground/80 m-0 max-w-[40ch] text-center text-sm italic",
          "[text-wrap:balance]"
        )}
      >
        {props.connection.relation}
      </figcaption>
    </motion.figure>
  );
}

function ConnectionEnd(props: { record: MoireRecord }) {
  return (
    <a
      href={recordUrl(props.record)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex shrink-0 flex-col items-start gap-y-1.5 text-left",
        END_WIDTH
      )}
    >
      {props.record.imageUrl && (
        <motion.div
          initial={HOVER.rest}
          whileHover={HOVER.lift}
          whileTap={HOVER.press}
          transition={HOVER.spring}
          className={cn(
            "w-full overflow-hidden rounded-lg border",
            "transition-shadow duration-300 ease-out group-hover:shadow-lg"
          )}
        >
          <img
            src={props.record.imageUrl}
            alt=""
            loading="lazy"
            className="m-0 aspect-square w-full object-cover"
          />
        </motion.div>
      )}
      <span
        className={cn(
          "text-muted-foreground group-hover:text-foreground",
          "line-clamp-2 min-h-[2lh] text-[11px] leading-snug",
          "transition-colors duration-300 ease-out"
        )}
      >
        {props.record.label}
      </span>
    </a>
  );
}
