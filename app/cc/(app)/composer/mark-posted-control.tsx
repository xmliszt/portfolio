"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { markPostPosted } from "@/app/cc/(app)/_actions/mark-post-posted";
import { formatSgt } from "@/lib/cc/format-sgt";

type MarkPostedControlProps = {
  postId: string;
  status: string;
  postedAt: string | null;
  url: string | null;
  size?: "md" | "sm";
};

export function MarkPostedControl(props: MarkPostedControlProps) {
  const [isMarking, setIsMarking] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      try {
        await markPostPosted({
          postId: props.postId,
          url: url.trim() || undefined,
        });
        setIsMarking(false);
      } catch {
        setError("Could not save. Try again.");
      }
    });
  }

  if (props.status === "posted") {
    return (
      <span className="text-cc-ok flex flex-wrap items-center gap-x-2 text-[11px] tracking-[0.1em]">
        POSTED ✓
        {props.postedAt !== null &&
          ` ${formatSgt({ date: new Date(props.postedAt), pattern: "EEE dd MMM HH:mm" })} SGT`}
        {props.url !== null && (
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            LIVE ↗
          </a>
        )}
      </span>
    );
  }

  if (!isMarking) {
    return (
      <CcButton
        type="button"
        variant="ok"
        size={props.size}
        onClick={() => setIsMarking(true)}
      >
        MARK POSTED + PASTE URL
      </CcButton>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-wrap items-center gap-x-2 gap-y-2"
    >
      <label htmlFor={`posted-url-${props.postId}`} className="sr-only">
        Live URL
      </label>
      <input
        id={`posted-url-${props.postId}`}
        type="url"
        autoFocus
        className="cc-input min-w-0 flex-[1_1_220px]"
        placeholder="Paste the live URL (optional)"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />
      <CcButton
        type="submit"
        variant="ok"
        size={props.size}
        disabled={isPending}
      >
        {isPending ? "SAVING…" : "MARK POSTED"}
      </CcButton>
      <CcButton
        type="button"
        size={props.size}
        onClick={() => setIsMarking(false)}
      >
        CANCEL
      </CcButton>
      {error !== undefined && (
        <span role="alert" className="text-cc-warn text-[11px]">
          {error}
        </span>
      )}
    </form>
  );
}
