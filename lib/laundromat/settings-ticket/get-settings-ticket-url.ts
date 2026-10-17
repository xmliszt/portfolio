import { SETTINGS_TICKET_HASH_PREFIX } from "./settings-ticket";

/** Return the link that opens the laundromat at `origin` and restores the ticket whose code is `code`. */
export function getSettingsTicketUrl(options: {
  origin: string;
  code: string;
}) {
  return `${options.origin}/${SETTINGS_TICKET_HASH_PREFIX}${options.code}`;
}
