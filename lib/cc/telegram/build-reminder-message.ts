import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { type MetricField, type PlatformId,PLATFORMS } from "@/lib/cc/platforms";

type ReminderPost = {
  id: string;
  platformId: PlatformId;
  title: string | null;
  body: string;
  target: string | null;
  url: string | null;
};

type ReminderMessageInput =
  | { kind: "post"; post: ReminderPost; timeLabel: string; composeUrl: string }
  | { kind: "reply"; post: ReminderPost }
  | {
      kind: "log";
      post: ReminderPost;
      checkpoint: string;
      lastValues: { [field in MetricField]?: number | null };
    }
  | { kind: "repost"; post: ReminderPost; ratio: number };

const PREVIEW_LENGTH = 280;

function describePost(post: ReminderPost) {
  const platform = PLATFORMS[post.platformId].label;
  const where = post.target === null ? platform : `${platform} ${post.target}`;
  const name = post.title ?? post.body.split("\n").find((line) => line.trim() !== "") ?? "";
  return { where, name: name.slice(0, 80) };
}

/** Build the text and link buttons of one reminder message, without sending it. */
export function buildReminderMessage(input: ReminderMessageInput) {
  const { where, name } = describePost(input.post);
  const composerUrl = `${CC_ORIGIN}/composer?post=${input.post.id}`;
  switch (input.kind) {
    case "post": {
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
        ].join("\n"),
        buttons: [
          { text: "Copy in composer", url: composerUrl },
          { text: `Open ${PLATFORMS[input.post.platformId].label}`, url: input.composeUrl },
        ],
      };
    }
    case "reply":
      return {
        text: `💬 Reply to comments · ${where}\n${name}\nThe first 30–60 minutes matter most.`,
        buttons:
          input.post.url === null ? [] : [{ text: "Open the post", url: input.post.url }],
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
          fields.join(" "),
          `Last: ${last.join(" ")}`,
          "Use - to skip a number. Send undo to revert the last entry.",
        ].join("\n"),
        buttons: [{ text: "Log in CC", url: `${CC_ORIGIN}/log` }],
      };
    }
    case "repost":
      return {
        text: `🔁 Repost idea · ${where}\n${name}\nIt did ${input.ratio.toFixed(1)}× your ${PLATFORMS[input.post.platformId].label} median at +24h. Repost or re-cut it in the next ${PLATFORMS[input.post.platformId].label} window.`,
        buttons: [{ text: "Open composer", url: composerUrl }],
      };
    default: {
      const unhandled: never = input;
      return unhandled;
    }
  }
}
