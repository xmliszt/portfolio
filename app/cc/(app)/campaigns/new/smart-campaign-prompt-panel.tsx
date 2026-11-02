"use client";

import { useState } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { CopyButton } from "@/app/cc/(app)/composer/copy-button";
import { writeClipboard } from "@/app/cc/(app)/composer/write-clipboard";
import { buildChatgptUrl } from "@/lib/cc/build-chatgpt-url";
import type {
  buildSmartCampaignPlan,
  SkippedPlatform,
} from "@/lib/cc/build-smart-campaign-plan";
import { formatSgt } from "@/lib/cc/format-sgt";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { PLATFORMS } from "@/lib/cc/platforms";
import { REPOST_STRATEGY } from "@/lib/cc/repost-strategy";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";

type SmartCampaignPromptPanelProps = {
  prompt: string;
  plan: ReturnType<typeof buildSmartCampaignPlan>;
  isStale: boolean;
};

function formatDay(day: string) {
  return formatSgt({
    date: sgtToUtc({ date: day, time: "00:00" }),
    pattern: "EEE dd MMM",
  });
}

function describeSkipped(skipped: SkippedPlatform) {
  const label = PLATFORMS[skipped.platformId].label;
  switch (skipped.reason) {
    case "no-media":
      return `No posts for ${label}: it needs media you don't have.`;
    case "kind":
      return `No posts for ${label} in this kind of campaign. ${REPOST_STRATEGY[skipped.platformId].how}`;
    case "repost-gap":
      return `No posts for ${label}: the last one is too recent; it is ready again on ${formatDay(skipped.readyOn)}. ${REPOST_STRATEGY[skipped.platformId].how}`;
    default: {
      const unhandled: never = skipped;
      return unhandled;
    }
  }
}

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
      bodyClassName="flex flex-col gap-y-3 px-3 py-2.5"
    >
      {props.isStale && (
        <p role="status" className="text-cc-warn text-[12px]">
          The form changed after this prompt was made. Generate it again to
          include the changes.
        </p>
      )}
      {props.plan.skipped.map((skipped) => (
        <p
          key={skipped.platformId}
          className="text-muted-foreground text-[12px]"
        >
          {describeSkipped(skipped)}
        </p>
      ))}
      {Object.entries(props.plan.notBefore).flatMap(([platformId, day]) =>
        isPlatformId(platformId) && day !== undefined
          ? [
              <p key={platformId} className="text-cc-warn text-[12px]">
                {PLATFORMS[platformId].label}: the last post for this product is
                recent, so its posts wait until {formatDay(day)}, when the{" "}
                {REPOST_STRATEGY[platformId].minGapDays}-day gap ends.
              </p>,
            ]
          : []
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
