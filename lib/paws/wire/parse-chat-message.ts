import type { ChatMessage } from "@/lib/paws/wire-types";

import { parseWireId } from "./parse-wire-id";
import { WIRE_LIMITS } from "./wire-limits";

/** Return the chat line the server broadcast, or `undefined` when the payload is not one or its text is empty or longer than `WIRE_LIMITS.maxChatLength` characters. */
export function parseChatMessage(value: unknown): ChatMessage | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const id = "id" in value ? parseWireId(value.id) : undefined;
  const userId = "userId" in value ? parseWireId(value.userId) : undefined;
  const text =
    "text" in value &&
    typeof value.text === "string" &&
    value.text !== "" &&
    Array.from(value.text).length <= WIRE_LIMITS.maxChatLength
      ? value.text
      : undefined;
  if (id === undefined || userId === undefined || text === undefined)
    return undefined;
  return { id, userId, text };
}
