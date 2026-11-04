"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { addReply } from "@/app/cc/(app)/_actions/add-reply";

type AddReplyButtonProps = {
  postId: string;
};

export function AddReplyButton(props: AddReplyButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await addReply({ parentId: props.postId });
        if (result.kind === "error") {
          setError(result.message);
          return;
        }
        router.push(`/composer?post=${result.postId}`);
      } catch {
        setError("Could not add the reply. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2">
      <CcButton
        type="button"
        size="sm"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? "ADDING…" : "+ ADD REPLY"}
      </CcButton>
      <span className="text-muted-foreground text-[11px]">
        Scheduled a minute after this post or its last reply, as a thread. Turn
        on auto-post on the reply to post it.
      </span>
      {error !== undefined && (
        <span role="alert" className="text-cc-warn text-[12px]">
          {error}
        </span>
      )}
    </div>
  );
}
