"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

import { cn } from "@/app/craft/stations/three-d-rolling-slider/utils";

export function AppIcon(props: {
  alt: string;
  lightUrl: string;
  darkUrl: string;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={cn(
        // 256px
        "size-64",
        // ios corner radius is 1:6.4 -> 256 / 6.4 = 40px
        "overflow-clip rounded-[40px] [corner-shape:squircle]",
        "border-background border-2",
        "shadow-md",
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
    </div>
  );
}
