"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { FlyOutTooltip } from "@/components/ui/fly-out-tooltip";
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
    <FlyOutTooltip
      label={appIconImageAlt ?? "App Icon"}
      content={
        <div className="size-16 overflow-clip rounded-[25%] shadow-md">
          <img
            src={iconImage}
            alt={appIconImageAlt ?? "App Icon"}
            width={96}
            height={96}
            className="m-0 size-full object-cover p-0"
          />
        </div>
      }
    >
      <span className="group relative m-0 inline-block w-fit">
        <Link
          href={href}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            "font-normal no-underline transition-colors [&>p]:m-0"
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
    </FlyOutTooltip>
  );
}
