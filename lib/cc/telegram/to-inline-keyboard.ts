import type { TelegramButton } from "./telegram-button";

/** Return the Bot API `reply_markup` that shows `buttons` in one row, or `undefined` when there are none. */
export function toInlineKeyboard(buttons: readonly TelegramButton[]) {
  if (buttons.length === 0) return undefined;
  return {
    inline_keyboard: [
      buttons.map((button) => {
        switch (button.kind) {
          case "url":
            return { text: button.text, url: button.url };
          case "callback":
            return { text: button.text, callback_data: button.data };
          default: {
            const unhandled: never = button;
            return unhandled;
          }
        }
      }),
    ],
  };
}
