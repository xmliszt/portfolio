import { encodeSettingsTicketCode } from "./encode-settings-ticket-code";
import type { SettingsTicket } from "./settings-ticket";
import { SETTINGS_TICKET_HEADER } from "./settings-ticket";

/** Return the text of a `.ticket` file for `ticket`: a `SETTINGS_TICKET_HEADER` line, then the ticket's code on its own line. */
export function encodeSettingsTicket(ticket: SettingsTicket) {
  return `${SETTINGS_TICKET_HEADER}\n${encodeSettingsTicketCode(ticket)}\n`;
}
