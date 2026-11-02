"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { forkPost } from "@/app/cc/(app)/_actions/fork-post";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";

type ForkPostControlProps = {
  post: PostRow;
  platformId: PlatformId;
  dirty: boolean;
  startOpen?: boolean;
};

export function ForkPostControl(props: ForkPostControlProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(props.startOpen ?? false);
  const [platformId, setPlatformId] = useState<PlatformId>(props.platformId);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<
    { message: string; openPostId: string | undefined } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();
  const isSamePlatform = platformId === props.platformId;
  const isUnpostedRepost =
    isSamePlatform &&
    props.post.kind === "repost" &&
    props.post.status !== "posted";
  const isRepost = isSamePlatform && props.post.status === "posted";

  function changePlatform(event: React.ChangeEvent<HTMLSelectElement>) {
    if (isPlatformId(event.target.value)) setPlatformId(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if ((date === "") !== (time === "")) {
      setError({
        message: "Set both date and time, or neither.",
        openPostId: undefined,
      });
      return;
    }
    startTransition(async () => {
      try {
        const result = await forkPost({
          postId: props.post.id,
          platformId,
          scheduledAt:
            date === "" ? undefined : sgtToUtc({ date, time }).toISOString(),
        });
        if (result.kind === "error") {
          setError(result);
          return;
        }
        router.push(`/composer?post=${result.postId}`);
      } catch {
        setError({
          message: "Could not fork. Try again.",
          openPostId: undefined,
        });
      }
    });
  }

  if (!isOpen) {
    return (
      <CcButton type="button" size="sm" onClick={() => setIsOpen(true)}>
        FORK POST
      </CcButton>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Fork post"
      className="flex w-full flex-col gap-y-2"
    >
      <p className="text-muted-foreground text-[12px]">
        Copies the saved text, hashtags, link, title and uploaded media into a
        new post you can edit.{" "}
        {isUnpostedRepost
          ? "This repost is not posted, so pick another platform or edit it here."
          : isRepost
            ? "It is saved as a repost of this post."
            : "It is saved as a new post."}{" "}
        Leave the time empty to save a draft.
      </p>
      <div className="grid grid-cols-1 gap-x-2 gap-y-2">
        <CcField label="PLATFORM" htmlFor={`fork-platform-${props.post.id}`}>
          <select
            id={`fork-platform-${props.post.id}`}
            className="cc-input"
            value={platformId}
            onChange={changePlatform}
          >
            {PLATFORM_IDS.map((id) => (
              <option key={id} value={id}>
                {PLATFORMS[id].label}
              </option>
            ))}
          </select>
        </CcField>
        <CcField label="DATE (SGT)" htmlFor={`fork-date-${props.post.id}`}>
          <input
            id={`fork-date-${props.post.id}`}
            type="date"
            className="cc-input"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </CcField>
        <CcField label="TIME (SGT)" htmlFor={`fork-time-${props.post.id}`}>
          <input
            id={`fork-time-${props.post.id}`}
            type="time"
            className="cc-input"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </CcField>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <CcButton
          type="submit"
          variant="primary"
          size="sm"
          disabled={isPending || props.dirty || isUnpostedRepost}
        >
          {isPending ? "FORKING…" : "CREATE FORK"}
        </CcButton>
        {!props.startOpen && (
          <CcButton type="button" size="sm" onClick={() => setIsOpen(false)}>
            CANCEL
          </CcButton>
        )}
        {props.dirty && (
          <span className="text-muted-foreground text-[11px]">
            Save first: the fork copies the saved post.
          </span>
        )}
        {error !== undefined && (
          <span role="alert" className="text-cc-warn text-[12px]">
            {error.message}{" "}
            {error.openPostId !== undefined && (
              <Link
                href={`/composer?post=${error.openPostId}`}
                className="text-primary"
              >
                Open it →
              </Link>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
