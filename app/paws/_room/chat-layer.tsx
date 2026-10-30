"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import type { ChatResponse } from "@/lib/paws/chat/chat-api-types";
import { WIRE_LIMITS } from "@/lib/paws/wire/wire-limits";
import { cn } from "@/lib/utils";

import { BubbleFrame } from "./bubble-frame";
import type { ChatBubble } from "./chat-bubble";
import { COMPOSE_ANCHOR_PREFIX } from "./compose-anchor-prefix";
import { RevealedText } from "./revealed-text";

const ANCHOR_CLASS = "absolute top-0 left-0 w-max max-w-[220px]";
const FADE_OUT = { opacity: 0, transition: { duration: 0.2 } } as const;

type ChatLayerProps = {
  bubbles: ChatBubble[];
  ownUserId: string | undefined;
  ownAccent: string;
  composing: boolean;
  anchors: React.RefObject<{ [key: string]: HTMLElement | undefined }>;
  onSend: (text: string) => Promise<ChatResponse["kind"]>;
  onCloseCompose: () => void;
  onReopenCompose: () => void;
};

/** Render each cat's speech bubble and the visitor's compose bubble, placed over the canvas by whoever writes positions into `anchors`. */
export function ChatLayer(props: ChatLayerProps) {
  const { copy } = usePawsCopy();
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (props.composing) inputRef.current?.focus();
  }, [props.composing]);

  function anchor(key: string) {
    return (element: HTMLElement | null) => {
      if (element === null) delete props.anchors.current[key];
      else props.anchors.current[key] = element;
    };
  }

  function close() {
    setText("");
    setNotice(undefined);
    props.onCloseCompose();
  }

  function reopen(options: { line: string; notice: string }) {
    setText((current) => (current.trim() === "" ? options.line : current));
    setNotice(options.notice);
    props.onReopenCompose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (text.trim() === "") return;
    const line = text;
    close();
    const kind = await props.onSend(line);
    switch (kind) {
      case "sent":
        return;
      case "tooFast":
        reopen({ line, notice: copy.room.chatTooFast });
        return;
      case "signInRequired":
      case "notPlaying":
      case "invalid":
      case "failed":
        reopen({ line, notice: copy.room.chatFailed });
        return;
      default: {
        const unhandled: never = kind;
        return unhandled;
      }
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") close();
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function handleBlur() {
    if (text.trim() === "") close();
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value.replace(/\n/g, " "));
    setNotice(undefined);
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {props.bubbles
          .filter(
            (bubble) =>
              !(props.composing && bubble.message.userId === props.ownUserId)
          )
          .map((bubble) => (
            <motion.div
              key={bubble.message.id}
              ref={anchor(bubble.message.userId)}
              exit={FADE_OUT}
              className={ANCHOR_CLASS}
            >
              <BubbleFrame accent={bubble.accent} className="px-2 py-1">
                <p className="break-words">
                  <RevealedText
                    text={bubble.message.text}
                    steps={bubble.reveal}
                  />
                </p>
              </BubbleFrame>
            </motion.div>
          ))}
      </AnimatePresence>
      {props.composing && props.ownUserId !== undefined && (
        <div
          ref={anchor(`${COMPOSE_ANCHOR_PREFIX}${props.ownUserId}`)}
          className={cn(ANCHOR_CLASS, "pointer-events-auto")}
        >
          <BubbleFrame accent={props.ownAccent} className="px-2 py-1.5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-y-1">
              <label htmlFor={inputId} className="sr-only">
                {copy.room.chatLabel}
              </label>
              <div className="grid min-w-[140px] *:col-start-1 *:row-start-1">
                <span
                  aria-hidden
                  className="invisible border-b border-dashed px-0.5 pb-0.5 text-[16px] break-words whitespace-pre-wrap sm:text-[13px]"
                >
                  {`${text || copy.room.chatPlaceholder} `}
                </span>
                <textarea
                  ref={inputRef}
                  id={inputId}
                  rows={1}
                  autoComplete="off"
                  enterKeyHint="send"
                  maxLength={WIRE_LIMITS.maxChatLength}
                  placeholder={copy.room.chatPlaceholder}
                  value={text}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="resize-none overflow-hidden border-b border-dashed border-[var(--pw-ink-soft)] bg-transparent px-0.5 pb-0.5 text-[16px] break-words text-[var(--pw-ink)] outline-none placeholder:text-[var(--pw-ink-soft)]/70 focus-visible:border-[var(--pw-ink)] sm:text-[13px]"
                />
              </div>
              <p
                role="status"
                aria-live="polite"
                className={
                  notice ? "text-[12px] text-[var(--pw-pink)]" : "sr-only"
                }
              >
                {notice ?? ""}
              </p>
            </form>
          </BubbleFrame>
        </div>
      )}
    </div>
  );
}
