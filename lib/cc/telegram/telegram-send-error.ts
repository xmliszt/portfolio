/** An error from the Bot API's `sendMessage`, carrying its HTTP `status`. */
export class TelegramSendError extends Error {
  readonly status: number;

  constructor(options: { status: number; description: string | undefined }) {
    super(
      `Telegram sendMessage failed (${options.status}): ${options.description}`
    );
    this.status = options.status;
  }
}
