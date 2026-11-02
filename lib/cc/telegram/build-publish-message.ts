import type { AutoPublishPlatformId } from "@/lib/cc/auto-publish-platforms";
import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { PLATFORMS } from "@/lib/cc/platforms";

import type { TelegramButton } from "./telegram-button";

type PublishMessageInput = {
  postId: string;
  platformId: AutoPublishPlatformId;
  name: string;
  timeLabel: string;
} & (
  | { kind: "posted"; url: string | undefined }
  | { kind: "failed"; error: string; composeUrl: string }
);

const MAX_BUTTON_URL_LENGTH = 2000;

/** Build the text and link buttons of the message that says an auto-post went live or failed, without sending it. */
export function buildPublishMessage(input: PublishMessageInput): {
  text: string;
  buttons: TelegramButton[];
} {
  const platform = PLATFORMS[input.platformId];
  const composerUrl = `${CC_ORIGIN}/composer?post=${input.postId}`;
  switch (input.kind) {
    case "posted":
      return {
        text: [
          `✅ Auto-posted · ${platform.label} · ${input.timeLabel}`,
          input.name,
        ].join("\n"),
        buttons:
          input.url === undefined
            ? [{ kind: "url", text: "Open in CC", url: composerUrl }]
            : [{ kind: "url", text: "Open the post", url: input.url }],
      };
    case "failed":
      return {
        text: [
          `⚠️ Auto-post failed · ${platform.label} · ${input.timeLabel}`,
          input.name,
          "",
          input.error,
          "",
          "Post it by hand, or press Post now in CC.",
        ].join("\n"),
        buttons: [
          { kind: "url", text: "Open in CC", url: composerUrl },
          {
            kind: "url",
            text: `Open ${platform.label}`,
            url:
              input.composeUrl.length > MAX_BUTTON_URL_LENGTH
                ? platform.composeUrl
                : input.composeUrl,
          },
        ],
      };
    default: {
      const unhandled: never = input;
      return unhandled;
    }
  }
}
