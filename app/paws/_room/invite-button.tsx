"use client";

import { useEffect, useState } from "react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import type { CatLook } from "@/lib/paws/cat-look";
import { getInviteUrl } from "@/lib/paws/share/get-invite-url";
import { cn } from "@/lib/utils";

const COPIED_MS = 1800;

type InviteButtonProps = {
  roomId: string | undefined;
  look: CatLook | undefined;
};

function canShareLinks() {
  return (
    typeof navigator.share === "function" &&
    matchMedia("(pointer: coarse)").matches
  );
}

/** Render a menu row that invites a friend into the visitor's room: the share sheet on touch screens, otherwise the link copied, with the visitor's cat in the link preview when they have one. */
export function InviteButton(props: InviteButtonProps) {
  const { copy } = usePawsCopy();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  async function handleInvite() {
    const url = getInviteUrl({
      href: window.location.href,
      roomId: props.roomId,
      look: props.look,
    });
    const text =
      props.look === undefined ? copy.invite.text : copy.invite.textWithCat;
    if (canShareLinks()) {
      try {
        await navigator.share({ text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleInvite()}
      className={cn(
        FOCUS_RING_CLASS,
        "group flex h-10 items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 14 14"
        className="size-3.5 shrink-0 overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      >
        <path
          d="M1.5 6.5 12.5 1.5 9.5 12.5 6.5 8z"
          className="fill-transparent transition-colors group-hover:fill-[var(--pw-yellow)] group-focus-visible:fill-[var(--pw-yellow)]"
        />
        <path d="M6.5 8 12.5 1.5" />
      </svg>
      <span
        role="status"
        aria-live="polite"
        className="min-w-0 flex-1 truncate text-left"
      >
        {isCopied ? copy.invite.copied : copy.invite.button}
      </span>
    </button>
  );
}
