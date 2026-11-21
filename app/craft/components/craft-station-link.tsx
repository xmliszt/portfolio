"use client";

import { Maximize2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import type { CraftStation } from "@/app/craft/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type CraftStationLinkProps = {
  station: CraftStation;
};

export function CraftStationLink(props: CraftStationLinkProps) {
  return (
    <Link
      href={`/craft/${props.station.id}`}
      prefetch
      className="group block rounded-lg"
    >
      <motion.div
        layoutId={`craft_station.container.${props.station.id}`}
        whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "bg-background relative flex h-20 w-full flex-col justify-center overflow-hidden rounded-lg border py-4 text-left",
          "transition-[box-shadow,border-color] duration-300 group-hover:border-foreground/20 group-hover:shadow-md group-focus-visible:border-foreground/20 group-focus-visible:shadow-md"
        )}
      >
        <Maximize2
          aria-hidden
          className="text-muted-foreground absolute top-3 right-3 size-3.5 scale-75 opacity-0 transition-[opacity,scale] duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        />
        <motion.div
          layoutId={`craft_station.title.${props.station.id}`}
          className="shrink-0 truncate pr-9 pl-4 text-sm font-semibold"
        >
          {props.station.title}
        </motion.div>
        <ScrollArea className="relative w-full">
          <div className="text-muted-foreground mt-2 flex shrink-0 items-center gap-x-2 px-4 text-xs">
            {props.station.tags.map((tag) => (
              <motion.span
                layoutId={`craft_station.tag.${props.station.id}.${tag}`}
                className="bg-muted rounded-md border px-2.5 py-1 whitespace-nowrap"
                key={tag}
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="sr-only" />
          {/* left gradient blur */}
          <div className="from-background absolute top-0 left-0 h-full w-6 bg-gradient-to-r to-transparent" />
          {/* right gradient blur */}
          <div className="from-background absolute top-0 right-0 h-full w-6 bg-gradient-to-l to-transparent" />
        </ScrollArea>
      </motion.div>
    </Link>
  );
}
