import { Ellipsis } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import messageLogo from "./ios-message-logo.png";
import pokeLogo from "./poke-logo.jpg";

const shortcutUrl =
  "https://www.icloud.com/shortcuts/84049531ddc04e2da05a164d399e9cd2";

export const metadata: Metadata = {
  title: "Poke Brain Dump | Li Yuxuan",
  description:
    "Download the Speak To Poke Siri Shortcut and connect it to Notion.",
  alternates: {
    canonical: "https://liyuxuan.dev/poke/recipes/brain-dump",
  },
};

export default function BrainDumpPage() {
  return (
    <article className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-md flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center gap-8">
        <Image
          src={pokeLogo}
          alt="Poke Logo"
          className="size-18 rounded-full border shadow-lg"
        />

        <div className="max-w-58 space-y-3">
          <h1 className="text-2xl tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
            Speak To Poke
          </h1>
          <p className="text-muted-foreground text-sm leading-6">
            A Siri Shortcut for quickly sending message to Poke.
          </p>
        </div>

        <a
          href={shortcutUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Download the Speak To Poke Siri Shortcut"
          className={cn(
            "group w-52 rounded-3xl p-5 text-left",
            "text-white",
            "bg-linear-[135deg] from-[#6B74D4] to-[#4A54BE]",
            "hover:-translate-y-0.5 hover:scale-102 hover:shadow-[0_20px_60px_rgba(102,102,255,0.28)]",
            "transition-[scale,box-shadow,translate] duration-200"
          )}
        >
          <div className="flex flex-col gap-y-8">
            <div className="flex items-center justify-between">
              <Image
                src={messageLogo}
                alt="iOS Message Logo"
                className="size-8 rounded-lg"
              />
              <div className="scale-[1.15] rounded-full bg-white/20 p-1">
                <Ellipsis className="size-5 text-white" />
              </div>
            </div>
            <div className="font-semibold">Speak To Poke</div>
          </div>
        </a>

        {/* Spacer */}
        <div className="h-50 flex-1" />

        <div className="flex w-52 flex-col items-center gap-y-3">
          <p className="text-muted-foreground text-xs">
            For Apple users only. Requires Poke as your contact in Messages.
          </p>

          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            by Poke
            <Link
              className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100"
              href="https://poke.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100"
              href="https://poke.com/terms"
              target="_blank"
              rel="noreferrer"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
