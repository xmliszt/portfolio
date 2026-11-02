import "server-only";

import { buildComposeUrl } from "@/lib/cc/build-compose-url";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { getPostName } from "@/lib/cc/get-post-name";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import { buildPublishMessage } from "@/lib/cc/telegram/build-publish-message";
import { sendTelegramMessage } from "@/lib/cc/telegram/send-telegram-message";

import type { PostRow } from "./cc-rows";

/** Send the owner a Telegram message that `post` went live at `url` or failed with `error`; log and swallow a failed send, and do nothing when Telegram is not set up. */
export async function notifyPublishOutcome(options: {
  post: PostRow;
  now: Date;
  outcome:
    | { kind: "posted"; url: string | undefined }
    | { kind: "failed"; error: string };
}) {
  if (
    process.env.CC_TELEGRAM_BOT_TOKEN === undefined ||
    process.env.CC_TELEGRAM_CHAT_ID === undefined ||
    !isAutoPublishPlatform(options.post.platform)
  ) {
    return;
  }
  const shared = {
    postId: options.post.id,
    platformId: options.post.platform,
    name: getPostName(options.post),
    timeLabel: formatSgt({ date: options.now, pattern: "HH:mm" }),
  };
  const message =
    options.outcome.kind === "posted"
      ? buildPublishMessage({
          ...shared,
          kind: "posted",
          url: options.outcome.url,
        })
      : buildPublishMessage({
          ...shared,
          kind: "failed",
          error: options.outcome.error,
          composeUrl: buildComposeUrl({
            platformId: options.post.platform,
            body: getPostCopyText(options.post),
          }).url,
        });
  await sendTelegramMessage(message).catch((error: unknown) =>
    console.error("CC publish notice failed", options.post.id, error)
  );
}
