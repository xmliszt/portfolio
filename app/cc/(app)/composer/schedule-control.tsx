"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { schedulePost } from "@/app/cc/(app)/_actions/schedule-post";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { formatSgt, type SgtPattern } from "@/lib/cc/format-sgt";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";

type ScheduleControlProps = {
  post: PostRow;
};

function toSgtField(options: { at: string | null; pattern: SgtPattern }) {
  return options.at === null
    ? ""
    : formatSgt({ date: new Date(options.at), pattern: options.pattern });
}

export function ScheduleControl(props: ScheduleControlProps) {
  const [date, setDate] = useState(
    toSgtField({ at: props.post.scheduled_at, pattern: "yyyy-MM-dd" })
  );
  const [time, setTime] = useState(
    toSgtField({ at: props.post.scheduled_at, pattern: "HH:mm" })
  );
  const [message, setMessage] = useState<
    { kind: "done" | "error"; text: string } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);
    startTransition(async () => {
      try {
        await schedulePost({
          postId: props.post.id,
          scheduledAt: sgtToUtc({ date, time }).toISOString(),
        });
        setMessage({ kind: "done", text: "Scheduled. Replies moved with it." });
      } catch {
        setMessage({ kind: "error", text: "Could not schedule. Try again." });
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Schedule post"
      className="flex flex-wrap items-end gap-x-3 gap-y-2"
    >
      <CcField label="DATE (SGT)" htmlFor={`schedule-date-${props.post.id}`}>
        <input
          id={`schedule-date-${props.post.id}`}
          type="date"
          required
          className="cc-input"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </CcField>
      <CcField label="TIME (SGT)" htmlFor={`schedule-time-${props.post.id}`}>
        <input
          id={`schedule-time-${props.post.id}`}
          type="time"
          required
          className="cc-input"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </CcField>
      <CcButton type="submit" size="sm" variant="primary" disabled={isPending}>
        {isPending
          ? "SAVING…"
          : props.post.scheduled_at === null
            ? "SCHEDULE"
            : "RESCHEDULE"}
      </CcButton>
      {message !== undefined && (
        <span
          role={message.kind === "error" ? "alert" : "status"}
          className={
            message.kind === "error"
              ? "text-cc-warn text-[12px]"
              : "text-cc-ok text-[12px]"
          }
        >
          {message.text}
        </span>
      )}
    </form>
  );
}
