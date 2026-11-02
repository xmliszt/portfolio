"use client";

import { useState, useTransition } from "react";

import { CcField } from "@/app/cc/_ui/cc-field";
import { setRepostMode } from "@/app/cc/(app)/_actions/set-repost-mode";
import type { AutoPublishPlatformId } from "@/lib/cc/auto-publish-platforms";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { getRepostMode } from "@/lib/cc/get-repost-mode";
import { isRepostPublishMode } from "@/lib/cc/is-repost-publish-mode";
import type { RepostPublishMode } from "@/lib/cc/repost-publish-modes";

type RepostModeControlProps = {
  post: PostRow;
  platformId: AutoPublishPlatformId;
};

const MODE_LABELS: { [mode in RepostPublishMode]: string } = {
  post: "New post (its own text)",
  quote: "Quote the original",
  repost: "Plain repost (no text)",
};

function describeMode(options: {
  mode: RepostPublishMode;
  platformId: AutoPublishPlatformId;
}) {
  switch (options.mode) {
    case "post":
      return "Posts this text as a new post.";
    case "quote":
      return options.platformId === "x"
        ? "X quote posts need an Enterprise plan, so CC adds the original's link to the text; X shows it as a quote card."
        : "Posts this text with the original embedded as a quote.";
    case "repost":
      return "Reposts the original as it is. The text and media here are not used, and no numbers are logged.";
    default: {
      const unhandled: never = options.mode;
      return unhandled;
    }
  }
}

export function RepostModeControl(props: RepostModeControlProps) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const mode = getRepostMode(props.post);

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isRepostPublishMode(next)) return;
    setError(undefined);
    startTransition(async () => {
      try {
        await setRepostMode({ postId: props.post.id, mode: next });
      } catch {
        setError("Could not save. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
      <CcField label="PUBLISH AS" htmlFor={`repost-mode-${props.post.id}`}>
        <select
          id={`repost-mode-${props.post.id}`}
          className="cc-input"
          value={mode}
          onChange={handleChange}
          disabled={isPending || props.post.publish_claimed_at !== null}
        >
          {Object.entries(MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </CcField>
      <p className="text-muted-foreground max-w-[60ch] pb-2 text-[12px]">
        {describeMode({ mode, platformId: props.platformId })}
      </p>
      {error !== undefined && (
        <span role="alert" className="text-cc-warn text-[12px]">
          {error}
        </span>
      )}
    </div>
  );
}
