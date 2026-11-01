import "server-only";

type InlineButton = { text: string; url: string };

/** Send a plain-text message through the bot to `chatId` (the owner's chat by default) and return its `message_id`. */
export async function sendTelegramMessage(options: {
  text: string;
  chatId?: number;
  buttons?: InlineButton[];
  replyToMessageId?: number;
}) {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.CC_TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: options.chatId ?? process.env.CC_TELEGRAM_CHAT_ID,
        text: options.text,
        link_preview_options: { is_disabled: true },
        reply_parameters:
          options.replyToMessageId === undefined
            ? undefined
            : { message_id: options.replyToMessageId },
        reply_markup:
          options.buttons === undefined || options.buttons.length === 0
            ? undefined
            : { inline_keyboard: [options.buttons] },
      }),
    }
  );
  const payload: { ok: boolean; description?: string; result?: { message_id: number } } =
    await response.json();
  if (!payload.ok || payload.result === undefined) {
    throw new Error(`Telegram sendMessage failed: ${payload.description}`);
  }
  return payload.result.message_id;
}
