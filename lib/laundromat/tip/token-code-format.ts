import { getTicketChecksum } from "@/lib/laundromat/settings-ticket/get-ticket-checksum";

export const TOKEN_CODE_PREFIX = "LC1.";
export const TOKEN_CODE_HASH_PREFIX = "#token=";
export const TOKEN_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const TOKEN_CODE_BODY_LENGTH = 10;

/** Return the full token code for a 10-character `body`: the prefix, the body in two groups of 5, and its 2-character checksum. */
export function formatTokenCode(body: string) {
  const checksum = getTicketChecksum(body).slice(0, 2).toUpperCase();
  return `${TOKEN_CODE_PREFIX}${body.slice(0, 5)}-${body.slice(5)}-${checksum}`;
}
