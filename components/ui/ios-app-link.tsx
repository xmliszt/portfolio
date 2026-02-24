"use client";

import React from "react";
import { isMobile, isTablet } from "react-device-detect";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function IOSAppLink({
  href,
  children,
  target,
  appIconImageLight,
  appIconImageDark,
  appIconImageAlt,
}: {
  href: string;
  children: React.ReactNode;
  target?: React.HTMLAttributeAnchorTarget;
  appIconImageLight: string;
  appIconImageDark?: string;
  appIconImageAlt?: string;
}) {
  const { resolvedTheme } = useTheme();

  const lightIconImage = appIconImageLight;
  const darkIconImage = appIconImageDark ?? appIconImageLight;
  const iconImage = resolvedTheme === "dark" ? darkIconImage : lightIconImage;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <span className="group relative m-0 inline-block w-fit">
          <Link
            href={href}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              "font-normal transition-colors [&>p]:m-0",
              isMobile || isTablet
                ? "underline underline-offset-2"
                : "no-underline"
            )}
            target={target ?? "_blank"}
          >
            {children}
          </Link>
          <span
            className={cn(
              "bg-foreground absolute bottom-0 left-0 rounded-full",
              "h-0 w-0 opacity-0 transition-[opacity_width] duration-300 group-hover:h-px group-hover:w-full group-hover:opacity-100"
            )}
          ></span>
        </span>
      </TooltipTrigger>

      <TooltipContent
        side="top"
        align="end"
        sideOffset={4}
        className="bg-transparent p-0 shadow-none [&>span]:hidden"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20, y: 20, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, x: 40, y: 0, rotate: 15 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative shrink-0 overflow-hidden",
            "size-16 rounded-[158.22px]",
            "corner-squircle overflow-clip",
            "shadow-md"
          )}
        >
          <Image
            src={iconImage}
            alt={appIconImageAlt ?? "App Icon"}
            width={96}
            height={96}
            unoptimized
            className="m-0 size-full object-cover p-0"
          />
        </motion.div>
      </TooltipContent>
    </Tooltip>
  );
}
