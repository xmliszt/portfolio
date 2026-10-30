import { WIRE_LIMITS } from "@/lib/paws/wire/wire-limits";

/** Return `text` without control characters, trimmed, with whitespace runs collapsed to one space and cut to `WIRE_LIMITS.maxChatLength` characters. */
export function normalizeChatText(text: string) {
  const collapsed = text
    .replace(/\p{Cc}/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
  return Array.from(collapsed)
    .slice(0, WIRE_LIMITS.maxChatLength)
    .join("")
    .trimEnd();
}
