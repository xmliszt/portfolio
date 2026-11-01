"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { suggestPostSlot } from "@/app/cc/(app)/_actions/suggest-post-slot";
import type { PlatformId } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

type SuggestSlotButtonProps = {
  campaignId: string;
  platformId: PlatformId;
  postId?: string;
  onSuggest: (slot: { date: string; time: string }) => void;
};

type Note = { kind: "reason" | "error"; text: string };

export function SuggestSlotButton(props: SuggestSlotButtonProps) {
  const [note, setNote] = useState<Note | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  if (props.platformId === "producthunt") {
    return (
      <span className="text-muted-foreground text-[11px]">
        Product Hunt launches go live at 16:01 SGT; pick a Tue–Thu by hand.
      </span>
    );
  }

  function suggest() {
    setNote(undefined);
    startTransition(async () => {
      try {
        const slot = await suggestPostSlot({
          campaignId: props.campaignId,
          platformId: props.platformId,
          postId: props.postId,
        });
        if (slot === undefined) {
          setNote({ kind: "error", text: "No free slot in the next 14 days." });
          return;
        }
        props.onSuggest(slot);
        setNote({ kind: "reason", text: slot.reason });
      } catch {
        setNote({
          kind: "error",
          text: "Could not suggest a time. Try again.",
        });
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <CcButton type="button" onClick={suggest} disabled={isPending}>
        {isPending ? "FINDING…" : "SUGGEST"}
      </CcButton>
      {note !== undefined && (
        <span
          role="status"
          className={cn(
            "text-[12px]",
            note.kind === "reason" ? "text-cc-text-2" : "text-cc-warn"
          )}
        >
          {note.text}
        </span>
      )}
    </div>
  );
}
