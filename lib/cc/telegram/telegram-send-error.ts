/** An error from a Bot API method, carrying its HTTP `status`. */
export class TelegramSendError extends Error {
  readonly status: number;

  constructor(options: {
    method: string;
    status: number;
    description: string | undefined;
  }) {
    super(
      `Telegram ${options.method} failed (${options.status}): ${options.description}`
    );
    this.status = options.status;
  }
}
