import { getTicketChecksum } from "./get-ticket-checksum";
import type { SettingsTicket } from "./settings-ticket";
import { SETTINGS_TICKET_CODE_PREFIX } from "./settings-ticket";

function toBase64Url(text: string) {
  const binary = [...new TextEncoder().encode(text)]
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

/** Return `ticket` as one URL-safe code: `SETTINGS_TICKET_CODE_PREFIX`, the ticket as base64url JSON, a dot, and its checksum. */
export function encodeSettingsTicketCode(ticket: SettingsTicket) {
  const payload = toBase64Url(JSON.stringify(ticket));
  return `${SETTINGS_TICKET_CODE_PREFIX}${payload}.${getTicketChecksum(payload)}`;
}
