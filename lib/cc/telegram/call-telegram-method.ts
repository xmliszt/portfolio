import "server-only";

import { TelegramSendError } from "./telegram-send-error";

/** Call the Bot API `method` with a JSON `body` and return its `result`, or throw `TelegramSendError` when Telegram answers not ok. */
export async function callTelegramMethod(options: {
  method: string;
  body: object;
}) {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.CC_TELEGRAM_BOT_TOKEN}/${options.method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.body),
    }
  );
  const payload: { ok: boolean; description?: string; result?: unknown } =
    await response.json();
  if (!payload.ok) {
    throw new TelegramSendError({
      method: options.method,
      status: response.status,
      description: payload.description,
    });
  }
  return payload.result;
}
