import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { listMetricLabels } from "@/lib/cc/list-metric-labels";
import {
  type MetricField,
  type PlatformId,
  PLATFORMS,
} from "@/lib/cc/platforms";

import type { TelegramButton } from "./telegram-button";

type ReminderPost = {
  id: string;
  platformId: PlatformId;
  title: string | null;
  body: string;
  target: string | null;
  url: string | null;
};

type ReminderMessageInput =
  | {
      kind: "post";
      post: ReminderPost;
      timeLabel: string;
      composeUrl: string;
      media: readonly { file: string; url: string }[];
    }
  | { kind: "reply"; post: ReminderPost }
  | {
      kind: "log";
      post: ReminderPost;
      checkpoint: string;
      lastValues: { [field in MetricField]?: number | null };
    };

const PREVIEW_LENGTH = 280;
const MAX_BUTTON_URL_LENGTH = 2000;

function describePost(post: ReminderPost) {
  const platform = PLATFORMS[post.platformId].label;
  const where = post.target === null ? platform : `${platform} ${post.target}`;
  const name =
    post.title ??
    post.body.split("\n").find((line) => line.trim() !== "") ??
    "";
  return { where, name: name.slice(0, 80) };
}

/** Build the text and link buttons of one reminder message, without sending it. */
export function buildReminderMessage(input: ReminderMessageInput): {
  text: string;
  buttons: TelegramButton[];
} {
  const { where, name } = describePost(input.post);
  const composerUrl = `${CC_ORIGIN}/composer?post=${input.post.id}`;
  switch (input.kind) {
    case "post": {
      if (input.post.platformId === "producthunt") {
        return {
          text: [
            `🚀 Launch goes live · Product Hunt · ${input.timeLabel}`,
            ...(name === "" ? [] : [name]),
            "",
            "Product Hunt publishes the scheduled launch by itself. Be around to reply to the first comments, then share the link.",
          ].join("\n"),
          buttons:
            input.post.url === null
              ? [
                  {
                    kind: "url",
                    text: "Open Product Hunt",
                    url: "https://www.producthunt.com/",
                  },
                ]
              : [{ kind: "url", text: "Open the launch", url: input.post.url }],
        };
      }
      const preview =
        input.post.body.length > PREVIEW_LENGTH
          ? `${input.post.body.slice(0, PREVIEW_LENGTH)}…`
          : input.post.body;
      return {
        text: [
          `⏰ Post now · ${where} · ${input.timeLabel}`,
          ...(name === "" ? [] : [name]),
          "",
          preview,
          ...(input.media.length === 0
            ? []
            : [
                "",
                "Media (links work for 24 h):",
                ...input.media.map((item) => `📎 ${item.file}\n${item.url}`),
              ]),
        ].join("\n"),
        buttons: [
          { kind: "url", text: "Copy in composer", url: composerUrl },
          {
            kind: "url",
            text: `Open ${PLATFORMS[input.post.platformId].label}`,
            url:
              input.composeUrl.length > MAX_BUTTON_URL_LENGTH
                ? PLATFORMS[input.post.platformId].composeUrl
                : input.composeUrl,
          },
        ],
      };
    }
    case "reply":
      return {
        text: `💬 Reply to comments · ${where}\n${name}\nThe first 30–60 minutes matter most.`,
        buttons:
          input.post.url === null
            ? []
            : [{ kind: "url", text: "Open the post", url: input.post.url }],
      };
    case "log": {
      const fields = PLATFORMS[input.post.platformId].metrics;
      const last = fields.map((field) => {
        const value = input.lastValues[field];
        return value === undefined || value === null ? "-" : String(value);
      });
      return {
        text: [
          `📊 Log numbers · +${input.checkpoint} · ${where}`,
          name,
          "",
          "Reply to this message with one line, in this order:",
          listMetricLabels({ platformId: input.post.platformId }).join(" · "),
          `Last: ${last.join(" · ")}`,
          "Use - to skip a number. Send undo to revert the last entry.",
        ].join("\n"),
        buttons: [
          ...(input.post.url === null
            ? []
            : [
                {
                  kind: "url",
                  text: "Open the post",
                  url: input.post.url,
                } satisfies TelegramButton,
              ]),
          { kind: "url", text: "Log in CC", url: `${CC_ORIGIN}/log` },
        ],
      };
    }
    default: {
      const unhandled: never = input;
      return unhandled;
    }
  }
}
