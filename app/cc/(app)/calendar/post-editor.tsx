"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { schedulePost } from "@/app/cc/(app)/_actions/schedule-post";
import { skipPost } from "@/app/cc/(app)/_actions/skip-post";
import type { PlatformId } from "@/lib/cc/platforms";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";

type PostEditorProps = {
  post: {
    id: string;
    platformId: PlatformId;
    name: string;
    status: string;
    date: string;
    time: string;
    childCount: number;
  };
  closeHref: string;
};

export function PostEditor(props: PostEditorProps) {
  const post = props.post;
  const [date, setDate] = useState(post.date);
  const [time, setTime] = useState(post.time);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const isPosted = post.status === "posted";

  function run(options: { action: () => Promise<unknown>; done: string }) {
    setMessage(undefined);
    startTransition(async () => {
      try {
        await options.action();
        setMessage(options.done);
      } catch {
        setMessage("Could not save. Try again.");
      }
    });
  }

  function reschedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run({
      action: () =>
        schedulePost({
          postId: post.id,
          scheduledAt: sgtToUtc({ date, time }).toISOString(),
        }),
      done: "Rescheduled.",
    });
  }

  function skip() {
    run({ action: () => skipPost({ postId: post.id }), done: "Skipped." });
  }

  return (
    <Panel
      title="EDIT SLOT"
      aside={
        <Link href={props.closeHref} className="text-primary">
          CLOSE ✕
        </Link>
      }
      bodyClassName="flex flex-col gap-y-3.5 px-[18px] py-4"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <PlatformChip platformId={post.platformId} />
        <span className="text-cc-text-2 min-w-0 truncate">{post.name}</span>
        <span className="text-muted-foreground text-[11px] tracking-[0.1em]">
          {post.status.toUpperCase()}
        </span>
      </div>
      {isPosted ? (
        <span className="text-muted-foreground">
          Already posted; it stays where it went live.
        </span>
      ) : (
        <form
          onSubmit={reschedule}
          className="flex flex-wrap items-end gap-x-3 gap-y-3"
        >
          <CcField label="DATE (SGT)" htmlFor="edit-date">
            <input
              id="edit-date"
              type="date"
              required
              className="cc-input"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </CcField>
          <CcField label="TIME (SGT)" htmlFor="edit-time">
            <input
              id="edit-time"
              type="time"
              required
              className="cc-input"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </CcField>
          <CcButton type="submit" variant="primary" disabled={isPending}>
            {post.status === "scheduled" ? "RESCHEDULE" : "SCHEDULE"}
          </CcButton>
          {post.status !== "skipped" && (
            <CcButton
              type="button"
              variant="warn"
              disabled={isPending}
              onClick={skip}
            >
              SKIP
            </CcButton>
          )}
          <Link
            href={`/composer?post=${post.id}`}
            className="text-primary flex min-h-11 items-center text-[12px] tracking-[0.08em]"
          >
            Edit text in composer →
          </Link>
        </form>
      )}
      {post.childCount > 0 && !isPosted && (
        <span className="text-muted-foreground text-[11px]">
          Its {post.childCount} unposted{" "}
          {post.childCount === 1
            ? "reply or comment moves"
            : "replies and comments move"}{" "}
          with it.
        </span>
      )}
      {message !== undefined && (
        <span role="status" className="text-cc-ok text-[12px]">
          {message}
        </span>
      )}
    </Panel>
  );
}
