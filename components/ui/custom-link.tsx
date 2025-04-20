"use client";

import React from "react";
import { isMobile, isTablet } from "react-device-detect";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function CustomLink({
  href,
  children,
  target,
}: {
  href: string;
  children: React.ReactNode;
  target?: React.HTMLAttributeAnchorTarget;
}) {
  return (
    <object className="group relative m-0 inline-block w-fit">
      <Link
        href={href}
        className={cn(
          "text-muted-foreground hover:text-foreground font-normal transition-colors [&>p]:m-0",
          isMobile || isTablet ? "underline underline-offset-2" : "no-underline"
        )}
        target={target ?? "_blank"}
      >
        {children}
      </Link>
      <span
        className={cn(
          "bg-foreground absolute bottom-0 left-0 rounded-full",
          "h-0 w-0 opacity-0 transition-[opacity_width] duration-300 group-hover:h-[1px] group-hover:w-full group-hover:opacity-100"
        )}
      ></span>
    </object>
  );
}
