"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { FlyOutTooltip } from "@/components/ui/fly-out-tooltip";
import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";
import { getMeowUrl } from "@/lib/paws/sound/get-meow-url";
import { cn } from "@/lib/utils";

import { PawsPaw } from "./paws-paw";

const HOVER_MEOW_URL = getMeowUrl({
  age: "kitten",
  voice: "squeaky",
  mood: "chatty",
});
const HOVER_MEOW_VOLUME = 0.5;

type PawsAppLinkProps = {
  children: React.ReactNode;
};

/** Link to Paws that meows like a kitten when hovered and shows a riso paw print pressing in. */
export function PawsAppLink(props: PawsAppLinkProps) {
  const audioRef = useRef<HTMLAudioElement>(undefined);

  useEffect(() => {
    const audio = new Audio(HOVER_MEOW_URL);
    audio.preload = "auto";
    audio.volume = HOVER_MEOW_VOLUME;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = undefined;
    };
  }, []);

  function handlePointerEnter(event: React.PointerEvent) {
    const audio = audioRef.current;
    if (event.pointerType === "touch" || !audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }

  return (
    <FlyOutTooltip label="Paws" content={<PawsPaw />}>
      <span
        className="group relative m-0 inline-block w-fit"
        onPointerEnter={handlePointerEnter}
      >
        <Link
          href={PAWS_ORIGIN}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            "font-normal no-underline transition-colors [&>p]:m-0"
          )}
          target="_self"
        >
          {props.children}
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
