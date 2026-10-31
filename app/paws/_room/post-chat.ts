import type { ChatResponse } from "@/lib/paws/chat/chat-api-types";
import { parseChatResponse } from "@/lib/paws/chat/parse-chat-response";

/** Send one chat line, identified by `lineId`, to the room `roomId` with the visitor's access token and return the route's answer, or `failed` when the request or its answer fails. */
export async function postChat(options: {
  accessToken: string;
  roomId: string;
  lineId: string;
  text: string;
}): Promise<ChatResponse> {
  try {
    const response = await fetch("/api/paws/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: options.roomId,
        lineId: options.lineId,
        text: options.text,
      }),
    });
    return parseChatResponse(await response.json()) ?? { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}
