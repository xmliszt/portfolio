import type { ChatRequest } from "./chat-api-types";
import { normalizeChatText } from "./normalize-chat-text";

const ROOM_ID_PATTERN = /^[a-z0-9-]{1,64}$/;

/** Return the chat request in `value` with its text normalized by `normalizeChatText`, or `undefined` when the room id is not one or no text is left. */
export function parseChatRequest(value: unknown): ChatRequest | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("roomId" in value) ||
    typeof value.roomId !== "string" ||
    !ROOM_ID_PATTERN.test(value.roomId) ||
    !("text" in value) ||
    typeof value.text !== "string"
  )
    return undefined;
  const text = normalizeChatText(value.text);
  return text === "" ? undefined : { roomId: value.roomId, text };
}
