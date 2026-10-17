import { SETTINGS_TICKET_HASH_PREFIX } from "./settings-ticket";

/** Return the ticket code in `hash`, a URL's `#…` part, or `undefined` when it does not start with `SETTINGS_TICKET_HASH_PREFIX`. */
export function readSettingsTicketHash(hash: string) {
  if (!hash.startsWith(SETTINGS_TICKET_HASH_PREFIX)) return undefined;
  const code = hash.slice(SETTINGS_TICKET_HASH_PREFIX.length).trim();
  return code === "" ? undefined : code;
}
