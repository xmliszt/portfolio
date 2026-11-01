import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import type { RuleAction } from "@/lib/cc/evaluate-campaign-rules";
import { formatSgt } from "@/lib/cc/format-sgt";
import { PLATFORMS } from "@/lib/cc/platforms";
import { REPOST_STRATEGY } from "@/lib/cc/repost-strategy";

import type { TelegramButton } from "./telegram-button";

/** Build the Telegram text and buttons for one rule action on the post named `postName`; `repostId` is the repost row a "schedule-repost" action created, which its Skip button skips and its composer button opens. */
export function buildRuleMessage(options: {
  action: RuleAction;
  postName: string;
  repostId: string | undefined;
}): { text: string; buttons: TelegramButton[] } {
  const action = options.action;
  const platform = PLATFORMS[action.platformId].label;
  const ratio = `${action.ratio.toFixed(1)}×`;
  const composerButton = (postId: string): TelegramButton => ({
    kind: "url",
    text: "Open composer",
    url: `${CC_ORIGIN}/composer?post=${postId}`,
  });
  switch (action.kind) {
    case "schedule-repost": {
      const when = formatSgt({ date: action.at, pattern: "EEE dd MMM HH:mm" });
      const postId = options.repostId ?? action.postId;
      const headline =
        action.mode === "quote"
          ? `🔁 Scheduled a quote-post of your ${platform} post for ${when} · write a new first line in Composer · Skip`
          : `✂️ Saved a re-cut slot for ${when} · rewrite it in Composer · Skip`;
      return {
        text: [
          headline,
          options.postName,
          `It did ${ratio} your ${platform} median at +24 h.`,
        ].join("\n"),
        buttons: [
          { kind: "callback", text: "Skip", data: `skip:${postId}` },
          composerButton(postId),
        ],
      };
    }
    case "suggest-repost":
      return {
        text: `🔁 ${platform} · ${options.postName} did ${ratio} your median at +24 h. ${REPOST_STRATEGY[action.platformId].how}`,
        buttons: [composerButton(action.postId)],
      };
    case "suggest-recut":
      return {
        text: `📉 ${platform} · ${options.postName} did ${ratio} your median at +24 h. Try a new first line or a different image; open in composer.`,
        buttons: [composerButton(action.postId)],
      };
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
