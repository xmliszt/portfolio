"use client";

import { isMobile, isTablet } from "react-device-detect";

import { cn } from "@/lib/utils";

type ShadowSubtitleProps = {
  children: React.ReactNode;
};

export function ShadowSubtitle(props: ShadowSubtitleProps) {
  return (
    <span
      className={cn(
        "text-muted-foreground absolute -bottom-6 -left-2 -z-10 m-0 origin-top text-xl font-bold [mask:linear-gradient(transparent_2%,black_98%)]",
        isMobile || isTablet
          ? "scale-y-100 skew-x-[30deg] opacity-75"
          : "scale-y-0 skew-x-0 opacity-0",
        "transition-[opacity_transform] ease-in-out group-hover:scale-y-100 group-hover:skew-x-[30deg] group-hover:opacity-75"
      )}
    >
      {props.children}
    </span>
  );
}
