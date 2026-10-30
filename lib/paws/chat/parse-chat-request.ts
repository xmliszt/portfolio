import type { ChatRequest } from "./chat-api-types";
import { normalizeChatText } from "./normalize-chat-text";

const ROOM_ID_PATTERN = /^[a-z0-9-]{1,64}$/;
const LINE_ID_PATTERN = /^[0-9a-f-]{36}$/;

/** Return the chat request in `value` with its text normalized by `normalizeChatText`, or `undefined` when the room id or line id is not one or no text is left. */
export function parseChatRequest(value: unknown): ChatRequest | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("roomId" in value) ||
    typeof value.roomId !== "string" ||
    !ROOM_ID_PATTERN.test(value.roomId) ||
    !("lineId" in value) ||
    typeof value.lineId !== "string" ||
    !LINE_ID_PATTERN.test(value.lineId) ||
    !("text" in value) ||
    typeof value.text !== "string"
  )
    return undefined;
  const text = normalizeChatText(value.text);
  return text === ""
    ? undefined
    : { roomId: value.roomId, lineId: value.lineId, text };
}
