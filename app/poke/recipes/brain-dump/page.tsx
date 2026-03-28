import type { Metadata } from "next";
import Link from "next/link";

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

function PokeLogo() {
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-neutral-900 bg-neutral-950 text-white shadow-sm dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950">
      <svg
        viewBox="0 0 64 64"
        className="h-11 w-11"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
        aria-hidden="true"
      >
        <path d="M32 48V28" />
        <path d="M32 28c-1.5-9 2-15.5 8.5-20" />
        <path d="M32 28c-6.5-7-13.5-10-20-9" />
        <path d="M32 28c7-4 14-4.5 20-2" />
        <path d="M32 31c-5-4.5-9.5-5.5-14-3" />
        <path d="M32 31c4.5-5 9-7 14-6" />
        <path d="M28 48h8" />
      </svg>
    </div>
  );
}

export default function BrainDumpPage() {
  return (
    <article className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-md flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center gap-8">
        <PokeLogo />

        <div className="space-y-3">
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-neutral-500 dark:text-neutral-400">
            Poke Brain Dump
          </p>
          <h1 className="text-3xl font-light tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
            Speak To Poke
          </h1>
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            A Siri Shortcut for quickly dumping thoughts into Poke.
          </p>
        </div>

        <a
          href={shortcutUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Download the Speak To Poke Siri Shortcut"
          className="group w-full rounded-[1.75rem] bg-[#0a84ff] p-5 text-left text-white shadow-[0_20px_60px_rgba(10,132,255,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <span className="text-2xl">⌁</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold tracking-[-0.02em]">
                    Speak To Poke
                  </p>
                  <p className="mt-1 text-sm text-white/85">
                    Download Siri Shortcut
                  </p>
                </div>
                <span className="text-lg text-white/75 transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </div>
              <p className="mt-4 break-all text-[0.72rem] leading-5 text-white/70">
                {shortcutUrl}
              </p>
            </div>
          </div>
        </a>

        <div className="space-y-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          <p>Requires connecting to Poke in a messaging app.</p>
          <p>Apple users only.</p>
          <p>Needs a Notion connection.</p>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <Link className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100" href="https://poke.com/privacy" target="_blank" rel="noreferrer">
            Privacy
          </Link>
          <span aria-hidden="true">•</span>
          <Link className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100" href="https://poke.com/terms" target="_blank" rel="noreferrer">
            Terms
          </Link>
        </div>
      </div>
    </article>
  );
}
