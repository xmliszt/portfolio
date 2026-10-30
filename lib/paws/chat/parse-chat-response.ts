import { parseChatMessage } from "@/lib/paws/wire/parse-chat-message";

import type { ChatResponse } from "./chat-api-types";

const PLAIN_KINDS = [
  "tooFast",
  "notPlaying",
  "signInRequired",
  "invalid",
  "failed",
] as const;

/** Return the chat route's answer in `value`, or `undefined` when it is not one. */
export function parseChatResponse(value: unknown): ChatResponse | undefined {
  if (typeof value !== "object" || value === null || !("kind" in value))
    return undefined;
  if (value.kind === "sent") {
    const message =
      "message" in value ? parseChatMessage(value.message) : undefined;
    return message === undefined ? undefined : { kind: "sent", message };
  }
  const kind = PLAIN_KINDS.find((candidate) => candidate === value.kind);
  return kind === undefined ? undefined : { kind };
}
