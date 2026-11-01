"use client";

import { useState } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { CopyButton } from "@/app/cc/(app)/composer/copy-button";
import { writeClipboard } from "@/app/cc/(app)/composer/write-clipboard";
import { buildChatgptUrl } from "@/lib/cc/build-chatgpt-url";
import type { buildSmartCampaignPlan } from "@/lib/cc/build-smart-campaign-plan";
import { PLATFORMS } from "@/lib/cc/platforms";

type SmartCampaignPromptPanelProps = {
  prompt: string;
  plan: ReturnType<typeof buildSmartCampaignPlan>;
  isStale: boolean;
};

export function SmartCampaignPromptPanel(props: SmartCampaignPromptPanelProps) {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const postCount = props.plan.slots.filter(
    (slot) => slot.kind === "post"
  ).length;
  const childCount = props.plan.slots.length - postCount;

  async function handleOpen() {
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

  return (
    <Panel
      title="Prompt for ChatGPT"
      aside={`${postCount} posts · ${childCount} replies and comments · ${props.plan.waves.length} ${props.plan.waves.length === 1 ? "wave" : "waves"}`}
      className="flex-[1_1_100%]"
      bodyClassName="flex flex-col gap-y-3 px-[18px] py-4"
    >
      {props.isStale && (
        <p role="status" className="text-cc-warn text-[12px]">
          The form changed after this prompt was made. Generate it again to
          include the changes.
        </p>
      )}
      {props.plan.skipped.length > 0 && (
        <p className="text-muted-foreground text-[12px]">
          No posts for{" "}
          {props.plan.skipped
            .map((platformId) => PLATFORMS[platformId].label)
            .join(", ")}
          : they need media you don&apos;t have.
        </p>
      )}
      <pre className="text-cc-text-2 max-h-[360px] overflow-auto border p-3 font-[inherit] text-[12px] leading-relaxed break-words whitespace-pre-wrap">
        {props.prompt}
      </pre>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <CopyButton text={props.prompt} label="COPY PROMPT" />
        <CcButton type="button" variant="chatgpt" onClick={handleOpen}>
          OPEN CHATGPT ↗
        </CcButton>
        {message !== undefined && (
          <span role="status" className="text-cc-chatgpt text-[12px]">
            {message}
          </span>
        )}
      </div>
    </Panel>
  );
}
