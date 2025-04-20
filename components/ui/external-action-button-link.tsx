"use client";

import { useEffect, useRef } from "react";
import { Van } from "@phosphor-icons/react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Button } from "./button";

const SMOKE_INTERVAL = 400;

export function ExternalActionButtonLink(props: {
  href: string;
  title?: string;
  target?: string;
}) {
  const exhaustContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function generateSmoke() {
      // Generate smoke
      setInterval(() => {
        const smoke = document.createElement("div");
        exhaustContainer.current?.appendChild(smoke);
        // Remove smoke
        setTimeout(() => {
          exhaustContainer.current?.removeChild(
            exhaustContainer.current?.firstChild as Node
          );
        }, 1000);
      }, SMOKE_INTERVAL);
    }
    generateSmoke();
  }, []);

  return (
    <Link
      href={props.href}
      target={props.target}
      className="group flex justify-start *:cursor-pointer"
    >
      <Button
        variant={"outline"}
        className="text-muted-foreground my-2 flex h-8 items-center gap-x-3 overflow-visible !px-2 text-xs"
      >
        {props.title ?? `bring me there`}
        <div className="relative">
          <Van className="animate-car-wobble size-4" />
          <div
            ref={exhaustContainer}
            className={cn(
              "absolute bottom-0 left-1 h-full rotate-[-45deg]",
              "*:animate-smoke *:absolute *:right-0 *:bottom-0 *:z-10 *:h-2 *:w-2 *:rounded-full *:bg-stone-500 *:blur-[2px]"
            )}
          ></div>
          <div className="pointer-events-none absolute bottom-[1.5px] h-[1px] w-full border-b border-stone-700" />
        </div>
      </Button>
    </Link>
  );
}
