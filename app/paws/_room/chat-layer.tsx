"use client";

import { useEffect, useId, useRef, useState } from "react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import type { ChatResponse } from "@/lib/paws/chat/chat-api-types";
import { WIRE_LIMITS } from "@/lib/paws/wire/wire-limits";
import type { ChatMessage } from "@/lib/paws/wire-types";
import { cn } from "@/lib/utils";

export const COMPOSE_ANCHOR_PREFIX = "compose:";

const BUBBLE_CLASS =
  "pointer-events-none absolute top-0 left-0 opacity-0 max-w-[220px] border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-2 py-1 text-[13px] leading-snug text-[var(--pw-ink)] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-x-[5px] after:border-t-[6px] after:border-x-transparent after:border-t-[var(--pw-ink)]";

type ChatLayerProps = {
  bubbles: ChatMessage[];
  ownUserId: string | undefined;
  isComposing: boolean;
  anchors: React.RefObject<{ [key: string]: HTMLElement | undefined }>;
  onSend: (text: string) => Promise<ChatResponse["kind"]>;
  onCloseCompose: () => void;
};

/** Render each cat's speech bubble and the visitor's compose bubble, placed over the canvas by whoever writes positions into `anchors`. */
export function ChatLayer(props: ChatLayerProps) {
  const { copy } = usePawsCopy();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (props.isComposing) inputRef.current?.focus();
  }, [props.isComposing]);

  function anchor(key: string) {
    return (element: HTMLElement | null) => {
      props.anchors.current[key] = element ?? undefined;
    };
  }

  function close() {
    setText("");
    setNotice(undefined);
    props.onCloseCompose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSending || text.trim() === "") return;
    setIsSending(true);
    const kind = await props.onSend(text);
    setIsSending(false);
    switch (kind) {
      case "sent":
      case "notPlaying":
      case "signInRequired":
        close();
        return;
      case "refused":
        setNotice(copy.room.chatRefused);
        return;
      case "tooFast":
        setNotice(copy.room.chatTooFast);
        return;
      case "invalid":
      case "failed":
        setNotice(copy.room.chatFailed);
        return;
      default: {
        const unhandled: never = kind;
        return unhandled;
      }
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") close();
  }

  function handleBlur() {
    if (text.trim() === "" && !isSending) close();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
    setNotice(undefined);
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {props.bubbles
        .filter(
          (bubble) => !(props.isComposing && bubble.userId === props.ownUserId)
        )
        .map((bubble) => (
          <p
            key={bubble.id}
            ref={anchor(bubble.userId)}
            className={cn(BUBBLE_CLASS, "break-words")}
          >
            {bubble.text}
          </p>
        ))}
      {props.isComposing && props.ownUserId !== undefined && (
        <form
          ref={anchor(`${COMPOSE_ANCHOR_PREFIX}${props.ownUserId}`)}
          onSubmit={handleSubmit}
          className={cn(
            BUBBLE_CLASS,
            "pointer-events-auto flex w-[220px] flex-col gap-y-1 p-1"
          )}
        >
          <label htmlFor={inputId} className="sr-only">
            {copy.room.chatLabel}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={WIRE_LIMITS.maxChatLength}
            placeholder={copy.room.chatPlaceholder}
            value={text}
            disabled={isSending}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={cn(
              FOCUS_RING_CLASS,
              "h-8 w-full min-w-0 bg-transparent px-1 text-[16px] text-[var(--pw-ink)] placeholder:text-[var(--pw-ink-soft)]/70 sm:h-6 sm:text-[13px]"
            )}
          />
          <p
            role="status"
            aria-live="polite"
            className={
              notice ? "px-1 text-[12px] text-[var(--pw-pink)]" : "sr-only"
            }
          >
            {notice ?? ""}
          </p>
        </form>
      )}
    </div>
  );
}
