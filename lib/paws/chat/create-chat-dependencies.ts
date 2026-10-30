import "server-only";

import type { PawsServiceClient } from "@/lib/paws/profile/paws-service-client";

import type { ChatPipelineDependencies } from "./create-chat-pipeline";
import { getChatTopic } from "./get-chat-topic";

const KEEP_LINES_MS = 60 * 60_000;

/** Return the chat pipeline's dependencies on `client`; lines are counted but their text is never saved, and a user's rows older than `KEEP_LINES_MS` are deleted when they send another. */
export function createChatDependencies(
  client: PawsServiceClient
): ChatPipelineDependencies {
  return {
    isPlaying: async ({ roomId, userId, seenSince }) => {
      const { data, error } = await client
        .from("room_members")
        .select("role")
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .eq("role", "player")
        .gt("last_seen_at", seenSince.toISOString());
      if (error) throw error;
      return data.length > 0;
    },
    countLinesSince: async ({ userId, since }) => {
      const { count, error } = await client
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    insertLine: async ({ roomId, userId }) => {
      const pruned = await client
        .from("chat_messages")
        .delete()
        .eq("user_id", userId)
        .lt("created_at", new Date(Date.now() - KEEP_LINES_MS).toISOString());
      if (pruned.error) throw pruned.error;
      const { data, error } = await client
        .from("chat_messages")
        .insert({ room_id: roomId, user_id: userId })
        .select("id")
        .single();
      if (error) throw error;
      return String(data.id);
    },
    deleteLine: async (id) => {
      const { error } = await client
        .from("chat_messages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    markLine: async ({ id, status }) => {
      const { error } = await client
        .from("chat_messages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    broadcast: async ({ roomId, message }) => {
      const channel = client.channel(getChatTopic(roomId), {
        config: { private: true },
      });
      try {
        await channel.httpSend("chat", message);
      } finally {
        await client.removeChannel(channel);
      }
    },
    clock: { now: () => new Date() },
    log: (message, details) => console.warn(message, details),
  };
}
