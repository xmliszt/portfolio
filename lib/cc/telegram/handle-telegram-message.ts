import "server-only";

import { saveMetricEntry } from "@/lib/cc/data/save-metric-entry";
import { undoLastMetricEntry } from "@/lib/cc/data/undo-last-metric-entry";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { parseMetricLine } from "@/lib/cc/parse-metric-line";
import { PLATFORMS } from "@/lib/cc/platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { sendTelegramMessage } from "./send-telegram-message";

const CHECKPOINTS = ["1h", "24h", "7d", "extra"] as const;

/** Answer one message to the bot: tell anyone who sends /start their chat id, and for the owner's chat log a reply to a "Log numbers" message or undo the last entry. */
export async function handleTelegramMessage(options: {
  chatId: number;
  messageId: number;
  text: string;
  replyToMessageId: number | undefined;
}) {
  const text = options.text.trim();
  if (text.startsWith("/start")) {
    await sendTelegramMessage({
      chatId: options.chatId,
      text: `Your chat id is ${options.chatId}. Set CC_TELEGRAM_CHAT_ID to it.`,
    });
    return;
  }
  if (String(options.chatId) !== process.env.CC_TELEGRAM_CHAT_ID) return;

  const answer = (reply: string) =>
    sendTelegramMessage({ text: reply, replyToMessageId: options.messageId });

  if (text.toLowerCase() === "undo") {
    const removed = await undoLastMetricEntry();
    await answer(
      removed === undefined
        ? "Nothing to undo."
        : `Undone: removed the +${removed.checkpoint} entry.`
    );
    return;
  }

  const supabase = createCcServiceClient();
  const { data: reminder, error } =
    options.replyToMessageId === undefined
      ? { data: null, error: null }
      : await supabase
          .from("reminders")
          .select("*, post:posts!inner(*)")
          .eq("telegram_message_id", options.replyToMessageId)
          .eq("kind", "log")
          .maybeSingle();
  if (error) throw error;
  const checkpoint = CHECKPOINTS.find((value) => value === reminder?.checkpoint);
  if (reminder === null || checkpoint === undefined || !isPlatformId(reminder.post.platform)) {
    await answer("Reply to a “Log numbers” message with one line of numbers, or send undo.");
    return;
  }

  const platform = PLATFORMS[reminder.post.platform];
  const parsed = parseMetricLine({ line: text, fields: platform.metrics });
  switch (parsed.kind) {
    case "error":
      await answer(`Couldn't read that: ${parsed.reason}\nOrder: ${platform.metrics.join(" ")}`);
      return;
    case "undo":
      return;
    case "ok": {
      const saved = await saveMetricEntry({
        postId: reminder.post_id,
        checkpoint,
        values: parsed.values,
      });
      const summary = platform.metrics
        .filter((field) => parsed.values[field] !== undefined)
        .map((field) => `${field} ${formatMetricNumber(parsed.values[field])}`)
        .join(" · ");
      const comparison =
        saved.ratio === undefined
          ? ""
          : ` · ${saved.ratio.toFixed(1)}× your ${platform.label} median`;
      await answer(`Logged ✓ ${summary}${comparison}`);
      return;
    }
    default: {
      const unhandled: never = parsed;
      return unhandled;
    }
  }
}
