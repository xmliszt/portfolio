/** One inline keyboard button: a link, or a callback that sends `data` back to the webhook. */
export type TelegramButton =
  | { kind: "url"; text: string; url: string }
  | { kind: "callback"; text: string; data: string };
