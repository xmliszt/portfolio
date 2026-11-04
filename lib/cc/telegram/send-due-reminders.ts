import "server-only";

import { buildComposeUrl } from "@/lib/cc/build-compose-url";
import { signAssetUrls } from "@/lib/cc/data/sign-asset-urls";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getOriginalUrl } from "@/lib/cc/get-original-url";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { buildReminderMessage } from "./build-reminder-message";
import { sendTelegramMessage } from "./send-telegram-message";
import { TelegramSendError } from "./telegram-send-error";

const BATCH_SIZE = 10;
const STALE_CLAIM_MS = 5 * 60_000;
const MEDIA_LINK_EXPIRES_IN_S = 24 * 60 * 60;

/** Claim up to `BATCH_SIZE` due reminders that are unsent, or were claimed over 5 minutes ago without a `telegram_message_id`, by stamping `sent_at`; send each one, store its `telegram_message_id`, close one of a kind it has no message for or a "post" reminder of a post CC posts by itself or that is already posted, release a reminder whose send failed for a passing reason so the next run retries it, and close one Telegram rejected; return how many were sent. */
export async function sendDueReminders(options: { now: Date }) {
  const supabase = createCcServiceClient();
  const staleBefore = new Date(
    options.now.getTime() - STALE_CLAIM_MS
  ).toISOString();
  const isClaimable = `sent_at.is.null,and(telegram_message_id.is.null,sent_at.lt.${staleBefore})`;
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*, post:posts!inner(*)")
    .lte("fire_at", options.now.toISOString())
    .or(isClaimable)
    .is("done_at", null)
    .order("fire_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (error) throw error;
  if (reminders.length === 0) return { sent: 0 };
  const claimedAt = options.now.toISOString();
  const claimed = await Promise.all(
    reminders.map(async (reminder) => {
      const query = supabase
        .from("reminders")
        .update({ sent_at: claimedAt })
        .eq("id", reminder.id);
      const { data, error: claimError } = await (
        reminder.sent_at === null
          ? query.is("sent_at", null)
          : query.eq("sent_at", reminder.sent_at)
      ).select("id");
      if (claimError) throw claimError;
      return data.length === 1 ? [reminder] : [];
    })
  );

  const results = await Promise.all(
    claimed.flat().map(async (reminder) => {
      const post = reminder.post;
      const isPostHandled =
        reminder.kind === "post" &&
        (post.auto_publish || post.status === "posted");
      if (
        !isPlatformId(post.platform) ||
        post.status === "skipped" ||
        isPostHandled
      ) {
        const { error: closeError } = await supabase
          .from("reminders")
          .update({ done_at: options.now.toISOString() })
          .eq("id", reminder.id);
        if (closeError) throw closeError;
        return { id: reminder.id, isSent: false };
      }
      const platformId = post.platform;
      const reminderPost = {
        id: post.id,
        platformId,
        title: post.title,
        body: post.body,
        target: post.target,
        url: post.url,
      };
      const message = await (async () => {
        switch (reminder.kind) {
          case "post": {
            const { data: children, error: childrenError } = await supabase
              .from("posts")
              .select("title, assets")
              .eq("parent_post_id", post.id)
              .in("kind", ["reply", "comment"])
              .neq("status", "skipped")
              .order("created_at", { ascending: true });
            if (childrenError) throw childrenError;
            const assets = [
              { label: undefined, assets: post.assets },
              ...children.map((child) => ({
                label: child.title ?? "Reply",
                assets: child.assets,
              })),
            ].flatMap((group) =>
              parsePostAssets(group.assets).flatMap((asset) =>
                asset.path === undefined
                  ? []
                  : [
                      {
                        file:
                          group.label === undefined
                            ? asset.file
                            : `${group.label} · ${asset.file}`,
                        path: asset.path,
                      },
                    ]
              )
            );
            const urls = await signAssetUrls({
              paths: assets.map((asset) => asset.path),
              expiresInS: MEDIA_LINK_EXPIRES_IN_S,
              isDownload: true,
            });
            return buildReminderMessage({
              kind: "post",
              post: reminderPost,
              media: assets.flatMap((asset) => {
                const url = urls[asset.path];
                return url === undefined ? [] : [{ file: asset.file, url }];
              }),
              timeLabel: formatSgt({
                date: new Date(post.scheduled_at ?? reminder.fire_at),
                pattern: "HH:mm",
              }),
              composeUrl: buildComposeUrl({
                platformId,
                body: getPostCopyText({
                  body: post.body,
                  hashtags: post.hashtags,
                }),
                title: post.title ?? undefined,
                link: post.link ?? undefined,
                target: post.target ?? undefined,
                originalUrl: getOriginalUrl(post),
              }).url,
            });
          }
          case "reply":
            return buildReminderMessage({
              kind: "reply",
              post: reminderPost,
            });
          case "log": {
            const { data: last } = await supabase
              .from("post_metrics")
              .select("*")
              .eq("post_id", post.id)
              .order("captured_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            return buildReminderMessage({
              kind: "log",
              post: reminderPost,
              checkpoint: reminder.checkpoint ?? "extra",
              lastValues: last ?? {},
            });
          }
          default:
            return undefined;
        }
      })();
      if (message === undefined) {
        const { error: closeError } = await supabase
          .from("reminders")
          .update({ done_at: claimedAt })
          .eq("id", reminder.id);
        if (closeError) throw closeError;
        return { id: reminder.id, isSent: false };
      }

      const messageId = await sendTelegramMessage(message).catch(
        async (sendError: unknown) => {
          console.error("CC reminder send failed", reminder.id, sendError);
          const isPermanent =
            sendError instanceof TelegramSendError &&
            sendError.status >= 400 &&
            sendError.status < 500 &&
            sendError.status !== 429;
          const { error: releaseError } = await supabase
            .from("reminders")
            .update(isPermanent ? { done_at: claimedAt } : { sent_at: null })
            .eq("id", reminder.id);
          if (releaseError) throw releaseError;
          return undefined;
        }
      );
      if (messageId === undefined) return { id: reminder.id, isSent: false };
      const { error: updateError } = await supabase
        .from("reminders")
        .update({ telegram_message_id: messageId })
        .eq("id", reminder.id);
      if (updateError) throw updateError;
      return { id: reminder.id, isSent: true };
    })
  );
  return { sent: results.filter((result) => result.isSent).length };
}
