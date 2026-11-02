"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { saveChatgptVariant } from "@/app/cc/(app)/_actions/save-chatgpt-variant";
import { buildChatgptUrl } from "@/lib/cc/build-chatgpt-url";
import { countPostCharacters } from "@/lib/cc/count-post-characters";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

import { CharacterCount } from "./character-count";
import { CopyButton } from "./copy-button";
import { writeClipboard } from "./write-clipboard";

type ChatgptPanelProps = {
  postId: string;
  platformId: PlatformId;
  prompt: string;
  copyText: string;
  variant: PostRow | undefined;
  className?: string;
};

export function ChatgptPanel(props: ChatgptPanelProps) {
  const [pasted, setPasted] = useState(props.variant?.body ?? "");
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const bodyLimit: number | undefined = PLATFORMS[props.platformId].bodyLimit;
  const variantCopyText =
    props.variant === undefined
      ? undefined
      : getPostCopyText({
          body: props.variant.body,
          hashtags: props.variant.hashtags,
        });

  async function handleAsk() {
    const target = buildChatgptUrl({ prompt: props.prompt });
    switch (target.kind) {
      case "prefilled":
        window.open(target.url, "_blank", "noopener");
        setMessage("Opened ChatGPT with the prompt filled in.");
        return;
      case "copy-then-open": {
        const copying = writeClipboard(props.prompt);
        window.open(target.url, "_blank", "noopener");
        setMessage(
          (await copying)
            ? "The prompt is too long for a link, so it is on your clipboard. Paste it into ChatGPT."
            : "The prompt is too long for a link and could not be copied. Copy it from the box below."
        );
        return;
      }
      default: {
        const unhandled: never = target;
        return unhandled;
      }
    }
  }

  function handleSave() {
    setError(undefined);
    startTransition(async () => {
      try {
        await saveChatgptVariant({ postId: props.postId, body: pasted.trim() });
      } catch {
        setError("Could not save. Try again.");
      }
    });
  }

  return (
    <Panel
      title="Critique in ChatGPT"
      className={props.className}
      aside={
        <CcButton type="button" variant="chatgpt" onClick={handleAsk}>
          ASK CHATGPT ↗
        </CcButton>
      }
    >
      <div className="flex flex-col gap-y-3 px-3 py-2.5">
        {message !== undefined && (
          <p role="status" className="text-cc-chatgpt text-[12px]">
            {message}
          </p>
        )}
        <details className="group border">
          <summary className="text-muted-foreground flex min-h-7 cursor-pointer items-center justify-between gap-x-2 px-3 text-[10.5px] tracking-[0.04em] uppercase">
            <span>PROMPT · BUILT FROM YOUR NOTE AND THIS DRAFT</span>
            <span aria-hidden className="group-open:rotate-90">
              ▸
            </span>
          </summary>
          <div className="flex flex-col gap-y-2 border-t p-3">
            <pre className="text-cc-text-2 max-h-[320px] overflow-auto font-[inherit] text-[12px] leading-relaxed break-words whitespace-pre-wrap">
              {props.prompt}
            </pre>
            <div>
              <CopyButton text={props.prompt} label="COPY PROMPT" size="sm" />
            </div>
          </div>
        </details>
        <div className="flex flex-col gap-y-2">
          <label
            htmlFor={`chatgpt-paste-${props.postId}`}
            className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
          >
            PASTE CHATGPT&apos;S REWRITE
          </label>
          <textarea
            id={`chatgpt-paste-${props.postId}`}
            rows={5}
            className="cc-input resize-y"
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <CcButton
              type="button"
              variant="chatgpt"
              disabled={
                isPending ||
                pasted.trim() === "" ||
                pasted.trim() === props.variant?.body
              }
              onClick={handleSave}
            >
              {isPending
                ? "SAVING…"
                : props.variant === undefined
                  ? "SAVE · KEEP BOTH (A/B)"
                  : "UPDATE CHATGPT VERSION"}
            </CcButton>
            {error !== undefined && (
              <span role="alert" className="text-cc-warn text-[11px]">
                {error}
              </span>
            )}
          </div>
        </div>
        {variantCopyText !== undefined && (
          <div className="bg-border grid grid-cols-1 gap-x-px gap-y-px border md:grid-cols-2">
            <div className="bg-card flex min-w-0 flex-col gap-y-2 p-3">
              <div className="flex items-center justify-between gap-x-2">
                <span className="text-[10.5px] tracking-[0.04em] uppercase">
                  A · MINE
                </span>
                <CharacterCount
                  count={countPostCharacters({
                    text: props.copyText,
                    platformId: props.platformId,
                  })}
                  limit={bodyLimit}
                  platformId={props.platformId}
                />
              </div>
              <p className="text-cc-text-2 flex-1 text-[12px] leading-relaxed break-words whitespace-pre-wrap">
                {props.copyText}
              </p>
              <div>
                <CopyButton text={props.copyText} label="COPY A" size="sm" />
              </div>
            </div>
            <div className="bg-card flex min-w-0 flex-col gap-y-2 p-3">
              <div className="flex items-center justify-between gap-x-2">
                <span className="text-cc-chatgpt text-[10.5px] tracking-[0.04em] uppercase">
                  B · CHATGPT
                </span>
                <CharacterCount
                  count={countPostCharacters({
                    text: variantCopyText,
                    platformId: props.platformId,
                  })}
                  limit={bodyLimit}
                  platformId={props.platformId}
                />
              </div>
              <p className="text-cc-text-2 flex-1 text-[12px] leading-relaxed break-words whitespace-pre-wrap">
                {variantCopyText}
              </p>
              <div>
                <CopyButton
                  text={variantCopyText}
                  label="COPY B"
                  size="sm"
                  variant="chatgpt"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
