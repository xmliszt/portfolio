import "server-only";

import { createModerationCheck } from "@/lib/paws/profile/create-moderation-check";
import type { PawsServiceClient } from "@/lib/paws/profile/paws-service-client";
import { readMeowProvidersConfig } from "@/lib/paws/profile/read-meow-providers-config";

import type { ChatPipelineDependencies } from "./create-chat-pipeline";
import { getChatTopic } from "./get-chat-topic";

/** Return the chat pipeline's dependencies on `client`, with real moderation when `process.env` has its key and a fake one otherwise. */
export function createChatDependencies(
  client: PawsServiceClient
): ChatPipelineDependencies {
  const config = readMeowProvidersConfig(process.env);
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
    insertLine: async ({ roomId, userId, text }) => {
      const { data, error } = await client
        .from("chat_messages")
        .insert({ room_id: roomId, user_id: userId, text })
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
    moderation: createModerationCheck({ config: config.moderation, fetch }),
    clock: { now: () => new Date() },
    log: (message, details) => console.warn(message, details),
  };
}
