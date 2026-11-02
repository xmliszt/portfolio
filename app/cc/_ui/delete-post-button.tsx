"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { CcButton, type CcButtonSize } from "@/app/cc/_ui/cc-button";
import { deletePost } from "@/app/cc/(app)/_actions/delete-post";

type DeletePostButtonProps = {
  postId: string;
  name: string;
  afterHref: string;
  size?: CcButtonSize;
};

export function DeletePostButton(props: DeletePostButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const isConfirmed = window.confirm(
      `Delete “${props.name}” from CC? Its replies, reposts, reminders and logged numbers go too. A live post stays up on the platform.`
    );
    if (!isConfirmed) return;
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await deletePost({ postId: props.postId });
        if (result.kind === "error") {
          setError(result.message);
          return;
        }
        router.push(props.afterHref);
      } catch {
        setError("Could not delete. Try again.");
      }
    });
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <CcButton
        type="button"
        variant="warn"
        size={props.size}
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "DELETING…" : "DELETE POST"}
      </CcButton>
      {error !== undefined && (
        <span role="alert" className="text-cc-warn text-[12px]">
          {error}
        </span>
      )}
    </span>
  );
}
