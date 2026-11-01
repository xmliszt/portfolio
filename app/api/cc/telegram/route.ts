import { handleTelegramMessage } from "@/lib/cc/telegram/handle-telegram-message";
import { sendTelegramMessage } from "@/lib/cc/telegram/send-telegram-message";

type TelegramUpdate = {
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    reply_to_message?: { message_id: number };
  };
};

export async function POST(request: Request) {
  const secret = process.env.CC_TELEGRAM_WEBHOOK_SECRET;
  if (
    secret === undefined ||
    request.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  const update: TelegramUpdate = await request.json();
  if (update.message?.text !== undefined) {
    await handleTelegramMessage({
      chatId: update.message.chat.id,
      messageId: update.message.message_id,
      text: update.message.text,
      replyToMessageId: update.message.reply_to_message?.message_id,
    }).catch(async (error: unknown) => {
      console.error("CC Telegram update failed", error);
      await sendTelegramMessage({
        chatId: update.message?.chat.id,
        text: "Something went wrong. Check /log before you send it again.",
      }).catch(() => undefined);
    });
  }
  return Response.json({ ok: true });
}
