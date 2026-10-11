import { createClient } from "@supabase/supabase-js";

import { parseRemoteDraft } from "@/lib/laundromat/realtime/parse-remote-draft";
import { parseRemoteEntry } from "@/lib/laundromat/realtime/parse-remote-entry";
import { parseRoomPresence } from "@/lib/laundromat/realtime/parse-room-presence";
import type { RoomPresence } from "@/lib/laundromat/realtime/room-presence";

import type { RoomSource } from "./room-source";

const ROOM_CHANNEL = "laundromat:room";

/** Return a room source on a Supabase Realtime channel: presence for which tabs are here and what they are doing, broadcast for live notebook drafts and just-saved entries cut to `maxDraftChars`. */
export function createSupabaseRoomSource(options: {
  url: string;
  anonKey: string;
  maxDraftChars: number;
}): RoomSource {
  const client = createClient(options.url, options.anonKey, {
    auth: { persistSession: false },
  });
  return {
    join({ sessionId, onPeers, onDraft, onEntry, onConnectedChange }) {
      const channel = client.channel(ROOM_CHANNEL, {
        config: {
          presence: { key: sessionId },
          broadcast: { self: false },
        },
      });
      const state: { latest?: RoomPresence; isSubscribed: boolean } = {
        isSubscribed: false,
      };
      channel
        .on("presence", { event: "sync" }, () => {
          const now = Date.now();
          const peers = Object.entries(channel.presenceState()).flatMap(
            ([key, metas]) => {
              if (key === sessionId) return [];
              // Each tab tracks under its own key, so its newest meta is its current presence.
              const presence = parseRoomPresence({ value: metas.at(-1), now });
              return presence === undefined || presence.sessionId !== key
                ? []
                : [presence];
            }
          );
          onPeers(peers);
        })
        .on("broadcast", { event: "draft" }, ({ payload }) => {
          const draft = parseRemoteDraft({
            value: payload,
            maxChars: options.maxDraftChars,
          });
          if (draft !== undefined && draft.sessionId !== sessionId) {
            onDraft(draft);
          }
        })
        .on("broadcast", { event: "entry" }, ({ payload }) => {
          const entry = parseRemoteEntry({
            value: payload,
            maxChars: options.maxDraftChars,
          });
          if (entry !== undefined && entry.sessionId !== sessionId) {
            onEntry(entry);
          }
        })
        .subscribe((status) => {
          state.isSubscribed = status === "SUBSCRIBED";
          onConnectedChange(state.isSubscribed);
          if (state.isSubscribed && state.latest !== undefined) {
            void channel.track(state.latest);
          }
        });
      return {
        update(presence) {
          state.latest = presence;
          if (state.isSubscribed) void channel.track(presence);
        },
        sendDraft(draft) {
          if (!state.isSubscribed) return;
          void channel.send({
            type: "broadcast",
            event: "draft",
            payload: draft,
          });
        },
        sendEntry(entry) {
          if (!state.isSubscribed) return;
          void channel.send({
            type: "broadcast",
            event: "entry",
            payload: entry,
          });
        },
        leave() {
          void client.removeChannel(channel);
        },
      };
    },
    dispose() {
      void client.removeAllChannels();
    },
  };
}
