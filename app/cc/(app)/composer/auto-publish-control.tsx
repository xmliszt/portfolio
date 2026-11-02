"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { publishPostNow } from "@/app/cc/(app)/_actions/publish-post-now";
import { setAutoPublish } from "@/app/cc/(app)/_actions/set-auto-publish";
import type { AutoPublishPlatformId } from "@/lib/cc/auto-publish-platforms";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { PLATFORMS } from "@/lib/cc/platforms";

type AutoPublishControlProps = {
  post: PostRow;
  platformId: AutoPublishPlatformId;
  dirty: boolean;
};

export function AutoPublishControl(props: AutoPublishControlProps) {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const label = PLATFORMS[props.platformId].label;
  const post = props.post;
  const isReply = post.kind === "reply" || post.kind === "comment";

  function handleToggle(isOn: boolean) {
    setMessage(undefined);
    startTransition(async () => {
      try {
        const result = await setAutoPublish({ postId: post.id, isOn });
        if (result.kind === "error") setMessage(result.message);
      } catch {
        setMessage("Could not save. Try again.");
      }
    });
  }

  function handlePostNow() {
    if (!window.confirm(`Post this on ${label} now?`)) return;
    setMessage(undefined);
    startTransition(async () => {
      try {
        const result = await publishPostNow({ postId: post.id });
        if (result.kind === "error") setMessage(result.message);
      } catch {
        setMessage(
          `Lost touch with CC while posting. Check ${label} before trying again.`
        );
      }
    });
  }

  const postNowButton = (
    <CcButton
      type="button"
      size="sm"
      onClick={handlePostNow}
      disabled={isPending || props.dirty}
    >
      {isPending ? "WORKING…" : "POST NOW VIA API"}
    </CcButton>
  );

  return (
    <div className="flex flex-col gap-y-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] tracking-[0.04em]">
        {(() => {
          if (post.publish_claimed_at !== null && post.publish_error === null) {
            return (
              <span className="text-primary">
                AUTO-POSTING ON {label.toUpperCase()}…
              </span>
            );
          }
          if (post.publish_error !== null) {
            return (
              <>
                <span className="text-cc-warn">AUTO-POST FAILED</span>
                {postNowButton}
                <CcButton
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => handleToggle(false)}
                  disabled={isPending}
                >
                  TURN OFF
                </CcButton>
              </>
            );
          }
          if (post.auto_publish && isReply) {
            return (
              <>
                <span className="text-cc-ok">
                  AUTO-POSTS AFTER ITS PARENT ✓
                </span>
                <CcButton
                  type="button"
                  size="sm"
                  onClick={() => handleToggle(false)}
                  disabled={isPending}
                >
                  TURN OFF
                </CcButton>
              </>
            );
          }
          if (post.auto_publish && post.scheduled_at !== null) {
            return (
              <>
                <span className="text-cc-ok">
                  AUTO-POSTS{" "}
                  {formatSgt({
                    date: new Date(post.scheduled_at),
                    pattern: "EEE dd MMM HH:mm",
                  })}{" "}
                  SGT ✓
                </span>
                <CcButton
                  type="button"
                  size="sm"
                  onClick={() => handleToggle(false)}
                  disabled={isPending}
                >
                  TURN OFF
                </CcButton>
              </>
            );
          }
          return (
            <>
              <CcButton
                type="button"
                size="sm"
                variant="primary"
                onClick={() => handleToggle(true)}
                disabled={
                  isPending ||
                  props.dirty ||
                  post.status !== "scheduled" ||
                  post.scheduled_at === null
                }
              >
                {isReply
                  ? "AUTO-POST AFTER PARENT"
                  : "AUTO-POST AT SCHEDULED TIME"}
              </CcButton>
              {postNowButton}
            </>
          );
        })()}
      </div>
      {post.publish_error !== null && (
        <p className="text-cc-warn text-[12px]">{post.publish_error}</p>
      )}
      {props.dirty && post.publish_claimed_at === null && (
        <p className="text-muted-foreground text-[11px]">
          Save first: CC posts the saved text.
        </p>
      )}
      {message !== undefined && (
        <p role="alert" className="text-cc-warn text-[12px]">
          {message}
        </p>
      )}
    </div>
  );
}
