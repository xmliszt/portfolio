const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** Return the 32-bit FNV-1a hash of `text` as 8 lowercase hex digits. */
export function getTicketChecksum(text: string) {
  const hash = [...text].reduce(
    (current, character) =>
      Math.imul(current ^ (character.codePointAt(0) ?? 0), FNV_PRIME) >>> 0,
    FNV_OFFSET
  );
  return hash.toString(16).padStart(8, "0");
}
