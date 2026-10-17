import { getTicketChecksum } from "./get-ticket-checksum";
import { SETTINGS_TICKET_CODE_PREFIX } from "./settings-ticket";

const CODE_PATTERN = /^([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/;

function fromBase64Url(payload: string) {
  const binary = atob(payload.replaceAll("-", "+").replaceAll("_", "/"));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (character) => character.charCodeAt(0))
  );
}

/** Return the parsed JSON inside the text of a `.ticket` file, or `undefined` when it has no ticket code, its checksum does not match, or its payload is not JSON. */
export function decodeSettingsTicket(text: string): unknown {
  const code = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith(SETTINGS_TICKET_CODE_PREFIX))
    ?.slice(SETTINGS_TICKET_CODE_PREFIX.length);
  const match = code?.match(CODE_PATTERN);
  const payload = match?.at(1);
  if (payload === undefined || getTicketChecksum(payload) !== match?.at(2)) {
    return undefined;
  }
  try {
    return JSON.parse(fromBase64Url(payload));
  } catch {
    return undefined;
  }
}
