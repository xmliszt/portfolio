import { ROOM_TIMING } from "@/lib/paws/rooms/room-timing";
import type { RequestUser } from "@/lib/paws/supabase/read-request-user";
import type { ChatMessage } from "@/lib/paws/wire-types";

import type { ChatResponse } from "./chat-api-types";
import { parseChatRequest } from "./parse-chat-request";

const BURST = { windowMs: 10_000, max: 3 };
const MINUTE = { windowMs: 60_000, max: 20 };

export type ChatPipelineDependencies = {
  isPlaying: (options: {
    roomId: string;
    userId: string;
    seenSince: Date;
  }) => Promise<boolean>;
  countLinesSince: (options: {
    userId: string;
    since: Date;
  }) => Promise<number>;
  insertLine: (options: { roomId: string; userId: string }) => Promise<string>;
  deleteLine: (id: string) => Promise<void>;
  markLine: (options: { id: string; status: "sent" }) => Promise<void>;
  broadcast: (options: {
    roomId: string;
    message: ChatMessage;
  }) => Promise<void>;
  clock: { now: () => Date };
  log: (message: string, details: unknown) => void;
};

/** Return a chat pipeline that sends one line from a player in a room to everyone in it, after the room and rate checks; each attempt is recorded, without its text, before the rate check counts it, so parallel attempts count too. */
export function createChatPipeline(deps: ChatPipelineDependencies) {
  async function sendChat(options: {
    user: RequestUser | undefined;
    body: unknown;
  }): Promise<ChatResponse> {
    if (options.user === undefined || options.user.isAnonymous)
      return { kind: "signInRequired" };
    const request = parseChatRequest(options.body);
    if (request === undefined) return { kind: "invalid" };
    const userId = options.user.userId;
    const now = deps.clock.now().getTime();
    try {
      const isPlaying = await deps.isPlaying({
        roomId: request.roomId,
        userId,
        seenSince: new Date(now - ROOM_TIMING.memberFreshMs),
      });
      if (!isPlaying) return { kind: "notPlaying" };
      const id = await deps.insertLine({ roomId: request.roomId, userId });
      const [burst, minute] = await Promise.all(
        [BURST, MINUTE].map((limit) =>
          deps.countLinesSince({
            userId,
            since: new Date(now - limit.windowMs),
          })
        )
      );
      if (burst > BURST.max || minute > MINUTE.max) {
        await deps.deleteLine(id);
        return { kind: "tooFast" };
      }
      const message = { id: request.lineId, userId, text: request.text };
      await deps.broadcast({ roomId: request.roomId, message });
      await deps.markLine({ id, status: "sent" });
      return { kind: "sent", message };
    } catch (error) {
      deps.log("paws chat failed", error);
      return { kind: "failed" };
    }
  }

  return { sendChat };
}
