"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTheme } from "next-themes";

import { cn } from "@/app/craft/stations/three-d-rolling-slider/utils";

export function AppIcon(props: {
  alt: string;
  lightUrl: string;
  darkUrl: string;
  className?: string;
  layoutId?: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <motion.div
      layoutId={props.layoutId}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative shrink-0 overflow-hidden",
        "size-64",
        "overflow-clip rounded-[25%]",
        "border-background border-2",
        "shadow-sm",
        "border-[0.5px] border-black/10 dark:border-white/10",
        props.className
      )}
    >
      <Image
        src={resolvedTheme === "dark" ? props.darkUrl : props.lightUrl}
        alt={props.alt}
        width={300}
        height={300}
        unoptimized
        className="m-0 size-full object-cover p-0"
      />
    </motion.div>
  );
}
