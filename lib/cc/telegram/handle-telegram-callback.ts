import "server-only";

import { revalidatePath } from "next/cache";

import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { markPostSkipped } from "@/lib/cc/data/mark-post-skipped";

import { callTelegramMethod } from "./call-telegram-method";
import { parseCallbackData } from "./parse-callback-data";
import { toInlineKeyboard } from "./to-inline-keyboard";

/** Answer one inline button press: for the owner's chat, skip the post a "skip:<postId>" button names and mark its message "Skipped", keeping only its composer button; always answer the callback so Telegram stops its progress bar. */
export async function handleTelegramCallback(options: {
  callbackQueryId: string;
  chatId: number | undefined;
  messageId: number | undefined;
  messageText: string | undefined;
  data: string | undefined;
}) {
  const answer = (text: string | undefined) =>
    callTelegramMethod({
      method: "answerCallbackQuery",
      body: { callback_query_id: options.callbackQueryId, text },
    });
  const action = parseCallbackData(options.data ?? "");
  if (
    String(options.chatId) !== process.env.CC_TELEGRAM_CHAT_ID ||
    action === undefined
  ) {
    await answer(undefined);
    return;
  }

  switch (action.kind) {
    case "skip": {
      const post = await markPostSkipped({ postId: action.postId });
      if (post === undefined) {
        await answer("Already posted, so it was not skipped.");
        return;
      }
      revalidatePath("/cc", "layout");
      if (
        options.messageId !== undefined &&
        options.messageText !== undefined
      ) {
        await callTelegramMethod({
          method: "editMessageText",
          body: {
            chat_id: options.chatId,
            message_id: options.messageId,
            text: `${options.messageText}\n\n⏭ Skipped`,
            link_preview_options: { is_disabled: true },
            reply_markup: toInlineKeyboard([
              {
                kind: "url",
                text: "Open composer",
                url: `${CC_ORIGIN}/composer?post=${post.id}`,
              },
            ]),
          },
        });
      }
      await answer("Skipped");
      return;
    }
    default: {
      const unhandled: never = action.kind;
      return unhandled;
    }
  }
}
