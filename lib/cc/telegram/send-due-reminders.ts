import "server-only";

import { buildComposeUrl } from "@/lib/cc/build-compose-url";
import { formatSgt } from "@/lib/cc/format-sgt";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { buildReminderMessage } from "./build-reminder-message";
import { sendTelegramMessage } from "./send-telegram-message";

const BATCH_SIZE = 10;

/** Send every unsent reminder whose `fire_at` has passed, oldest first, and stamp `sent_at` and `telegram_message_id` on each; return how many were sent. */
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

  const results = await Promise.all(
    reminders.map(async (reminder) => {
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
                body: post.body,
                title: post.title ?? undefined,
                link: post.link ?? undefined,
                target: post.target ?? undefined,
              }).url,
            });
          case "reply":
            return buildReminderMessage({ kind: "reply", post: reminderPost });
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
      if (message === undefined) return { id: reminder.id, isSent: false };

      const messageId = await sendTelegramMessage(message);
      const { error: updateError } = await supabase
        .from("reminders")
        .update({
          sent_at: options.now.toISOString(),
          telegram_message_id: messageId,
        })
        .eq("id", reminder.id);
      if (updateError) throw updateError;
      return { id: reminder.id, isSent: true };
    })
  );
  return { sent: results.filter((result) => result.isSent).length };
}
