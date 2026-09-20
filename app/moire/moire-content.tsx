"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

import { CapturesStrip } from "./captures-strip";
import { ConnectionFigure } from "./connection-figure";
import { HOVER } from "./hover";
import { MOIRE_URL, MoireGraph } from "./moire-data";
import { MoireMark } from "./moire-mark";

/* ─────────────────────────────────────────────────────────
 * PAGE STORYBOARD
 *
 * Read top-to-bottom. Each value is ms after mount.
 *
 *    0ms   paper ground, the mark's own entrance runs itself
 *  420ms   tagline — "practice noticing."
 *  560ms   the two paragraphs
 *  760ms   stat row
 *  940ms   captures strip (staggered 60ms per thumbnail)
 * 1180ms   connections (staggered 120ms)
 * 1480ms   link out to the field
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  tagline: 420,
  prose: 560,
  stats: 760,
  captures: 940,
  connections: 1180,
  cta: 1480,
};

const RISE = {
  offsetY: 10,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

const CONNECTION_STAGGER = 0.12; // seconds

/*
  The DialKit panel for the mark is authoring furniture. Keeping the dynamic
  import inside the conditional lets the production build fold the branch away
  and drop the chunk entirely, rather than shipping a lazy one nothing loads.
*/
const MoireMarkTuner =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./moire-mark-tuner"), { ssr: false })
    : null;

type MoireContentProps = {
  /** Null when Moiré is unreachable; the corpus sections are then dropped. */
  graph: MoireGraph | null;
};

export function MoireContent(props: MoireContentProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = Object.values(TIMING).map((delay, index) =>
      setTimeout(() => setStage(index + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-y-10">
      {/* Mark and tagline are one unit — the tagline is the mark's caption. */}
      <div className="flex flex-col items-center gap-y-1">
        {MoireMarkTuner ? <MoireMarkTuner /> : <MoireMark />}
        <Rise visible={stage >= 1}>
          <p className="text-muted-foreground m-0 text-sm tracking-wide">
            practice noticing.
          </p>
        </Rise>
      </div>

      <Rise visible={stage >= 2}>
        <p>
          A moiré pattern appears when two patterns overlap and produce a third
          that was in neither of them. That is the whole idea behind{" "}
          <span className="text-foreground font-medium">Moiré</span>, which is
          where I keep everything that catches my attention — a photo of
          something on the street, a link, a screenshot, a quote, a half-formed
          thought.
        </p>
        <p>
          Nothing gets filed into folders. I just connect things to each other
          and write down why, in my own words. Enough of those connections and a
          shape starts to show up that I did not plan and could not have
          described in advance. That shape is closer to taste than any list of
          favourites I could write.
        </p>
      </Rise>

      {props.graph && (
        <Rise visible={stage >= 3}>
          <p className="text-muted-foreground m-0 text-center text-xs">
            <Count>{props.graph.stats.records}</Count> records and{" "}
            <Count>{props.graph.stats.connections}</Count> connections so far,
            since {formatSince(props.graph.stats.since)}.
          </p>
        </Rise>
      )}

      {props.graph && props.graph.captures.length > 0 && (
        <section className="flex flex-col gap-y-3">
          <Rise visible={stage >= 4}>
            <h2 className="m-0">recently noticed</h2>
          </Rise>
          <CapturesStrip
            captures={props.graph.captures}
            visible={stage >= 4}
            delay={0}
          />
        </section>
      )}

      {props.graph && props.graph.connections.length > 0 && (
        <section className="flex flex-col gap-y-6">
          <Rise visible={stage >= 5}>
            <h2 className="m-0">a few connections</h2>
            <p className="m-0">
              A record on its own says very little. Two of them, and the reason
              they belong together, say considerably more.
            </p>
          </Rise>
          <div className="flex flex-col gap-y-8">
            {props.graph.connections.map((connection, index) => (
              <ConnectionFigure
                key={connection.id}
                connection={connection}
                visible={stage >= 5}
                delay={index * CONNECTION_STAGGER}
              />
            ))}
          </div>
        </section>
      )}

      <Rise visible={stage >= 6} className="flex justify-center">
        <motion.a
          href={MOIRE_URL}
          target="_blank"
          rel="noreferrer"
          initial={HOVER.rest}
          whileHover={HOVER.lift}
          whileTap={HOVER.press}
          transition={HOVER.spring}
          className={cn(
            "group inline-flex items-center gap-x-2 rounded-full border px-5 py-2",
            "bg-card text-sm no-underline",
            "transition-shadow duration-300 ease-out hover:shadow-lg"
          )}
        >
          enter the field
          <ArrowUpRight
            className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            weight="bold"
          />
        </motion.a>
      </Rise>
    </div>
  );
}

function Rise(props: {
  visible: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: RISE.offsetY }}
      animate={{
        opacity: props.visible ? 1 : 0,
        y: props.visible ? 0 : RISE.offsetY,
      }}
      transition={RISE.spring}
      className={props.className}
    >
      {props.children}
    </motion.div>
  );
}

function Count(props: { children: number }) {
  return (
    <span className="text-foreground font-medium tabular-nums">
      {props.children}
    </span>
  );
}

function formatSince(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}
