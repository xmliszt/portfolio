import "server-only";

import { callTelegramMethod } from "./call-telegram-method";
import type { TelegramButton } from "./telegram-button";
import { TelegramSendError } from "./telegram-send-error";
import { toInlineKeyboard } from "./to-inline-keyboard";

/** Send a plain-text message through the bot to `chatId` (the owner's chat by default) and return its `message_id`. */
export async function sendTelegramMessage(options: {
  text: string;
  chatId?: number;
  buttons?: readonly TelegramButton[];
  replyToMessageId?: number;
}) {
  const result = await callTelegramMethod({
    method: "sendMessage",
    body: {
      chat_id: options.chatId ?? process.env.CC_TELEGRAM_CHAT_ID,
      text: options.text,
      link_preview_options: { is_disabled: true },
      reply_parameters:
        options.replyToMessageId === undefined
          ? undefined
          : { message_id: options.replyToMessageId },
      reply_markup: toInlineKeyboard(options.buttons ?? []),
    },
  });
  if (
    typeof result !== "object" ||
    result === null ||
    !("message_id" in result) ||
    typeof result.message_id !== "number"
  ) {
    throw new TelegramSendError({
      method: "sendMessage",
      status: 200,
      description: "no message_id in the result",
    });
  }
  return result.message_id;
}
