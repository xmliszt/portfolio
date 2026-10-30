import "server-only";

import type { MeowStore, StoredMeow } from "./meow-pipeline-types";
import { parseVoiceSettings } from "./parse-voice-settings";
import type { PawsServiceClient } from "./paws-service-client";

function parseStoredMeow(value: unknown): StoredMeow | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("key" in value && typeof value.key === "string") ||
    !("storage_path" in value && typeof value.storage_path === "string") ||
    !("blocked" in value && typeof value.blocked === "boolean")
  ) {
    return undefined;
  }
  return { key: value.key, storagePath: value.storage_path, blocked: value.blocked };
}

/** Return the meow pipeline's database operations on the `paws` tables. */
export function createMeowStore(client: PawsServiceClient): MeowStore {
  async function countAttempts(query: { column: "user_id" | "ip_hash"; value: string; outcomes: string[]; since: Date }) {
    const { count, error } = await client
      .from("meow_attempts")
      .select("id", { count: "exact", head: true })
      .eq(query.column, query.value)
      .in("outcome", query.outcomes)
      .gte("created_at", query.since.toISOString());
    if (error) throw error;
    return count ?? 0;
  }

  return {
    findCatMeow: async (query) => {
      const { data, error } = await client
        .from("cats")
        .select("voice, meows(key, storage_path, blocked)")
        .eq("user_id", query.userId)
        .maybeSingle();
      if (error) throw error;
      const voice = parseVoiceSettings(data?.voice);
      if (data === null || voice === undefined) return { kind: "noCat" };
      return { kind: "cat", voice, meow: parseStoredMeow(data.meows) };
    },
    countRefusalsSince: (query) =>
      countAttempts({
        column: "user_id",
        value: query.userId,
        outcomes: ["refusedByUs", "refusedByProvider"],
        since: query.since,
      }),
    countGenerationsSince: (query) =>
      countAttempts({ column: "ip_hash", value: query.ipHash, outcomes: ["generated"], since: query.since }),
    findMeow: async (query) => {
      const { data, error } = await client
        .from("meows")
        .select("key, storage_path, blocked")
        .eq("key", query.key)
        .maybeSingle();
      if (error) throw error;
      return parseStoredMeow(data);
    },
    insertMeow: async (meow) => {
      const { error } = await client.from("meows").upsert(
        {
          key: meow.key,
          storage_path: meow.storagePath,
          text: meow.text,
          voice: meow.voice,
          created_by: meow.createdBy,
        },
        { onConflict: "key", ignoreDuplicates: true }
      );
      if (error) throw error;
    },
    assignMeow: async (assignment) => {
      const { error } = await client
        .from("cats")
        .update({ meow_key: assignment.meowKey, voice: assignment.voice, updated_at: new Date().toISOString() })
        .eq("user_id", assignment.userId);
      if (error) throw error;
    },
    recordAttempt: async (attempt) => {
      const { error } = await client.from("meow_attempts").insert({
        user_id: attempt.userId,
        ip_hash: attempt.ipHash,
        outcome: attempt.outcome,
        credits: attempt.credits,
      });
      if (error) throw error;
    },
  };
}
