import "server-only";

import { buildComposeUrl } from "@/lib/cc/build-compose-url";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { buildReminderMessage } from "./build-reminder-message";
import { sendTelegramMessage } from "./send-telegram-message";

const BATCH_SIZE = 10;

/** Claim up to `BATCH_SIZE` unsent reminders whose `fire_at` has passed by stamping `sent_at`, send each one, store its `telegram_message_id`, and release a reminder whose send failed so the next run retries it; return how many were sent. */
export async function sendDueReminders(options: { now: Date }) {
  const supabase = createCcServiceClient();
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*, post:posts!inner(*)")
    .lte("fire_at", options.now.toISOString())
    .is("sent_at", null)
    .is("done_at", null)
    .order("fire_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (error) throw error;
  const claimedAt = options.now.toISOString();
  const { data: claimed, error: claimError } = await supabase
    .from("reminders")
    .update({ sent_at: claimedAt })
    .in(
      "id",
      reminders.map((reminder) => reminder.id)
    )
    .is("sent_at", null)
    .select("id");
  if (claimError) throw claimError;

  const results = await Promise.all(
    reminders
      .filter((reminder) => claimed.some((row) => row.id === reminder.id))
      .map(async (reminder) => {
        const post = reminder.post;
        if (!isPlatformId(post.platform) || post.status === "skipped") {
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
            case "post":
              return buildReminderMessage({
                kind: "post",
                post: reminderPost,
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
                }).url,
              });
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
            await supabase
              .from("reminders")
              .update({ sent_at: null })
              .eq("id", reminder.id);
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
