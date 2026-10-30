import { createClient } from "@supabase/supabase-js";

import { createPresenceTracker } from "@/lib/laundromat/realtime/create-presence-tracker";
import { parseRemoteClock } from "@/lib/laundromat/realtime/parse-remote-clock";
import { parseRemoteDraft } from "@/lib/laundromat/realtime/parse-remote-draft";
import { parseRemoteEntry } from "@/lib/laundromat/realtime/parse-remote-entry";
import { parseRoomPresence } from "@/lib/laundromat/realtime/parse-room-presence";
import type { RoomPresence } from "@/lib/laundromat/realtime/room-presence";

import type { RoomSource } from "./room-source";

const ROOM_CHANNEL = "laundromat:room";
const SUPABASE_CLIENT_PRESENCE_LIMIT = 5;
const TRACK_LIMIT_WITH_SPARE = SUPABASE_CLIENT_PRESENCE_LIMIT - 1;
const TRACK_WINDOW_MS = 30_000;

/** Return a room source on a Supabase Realtime channel: presence for which tabs are here and what they are doing, sent through a presence tracker limited to `TRACK_LIMIT_WITH_SPARE` per `TRACK_WINDOW_MS` with one kept for a change to `writingSince`, and broadcast for live notebook drafts and just-saved entries cut to `maxDraftChars`, and for clock readings stamped with when they arrived. */
export function createSupabaseRoomSource(options: {
  url: string;
  anonKey: string;
  maxDraftChars: number;
}): RoomSource {
  const client = createClient(options.url, options.anonKey, {
    auth: { persistSession: false },
  });
  const sends: { sentAts: number[] } = { sentAts: [] };
  return {
    join({
      sessionId,
      onPeers,
      onDraft,
      onEntry,
      onClock,
      onConnectedChange,
      onUrgentReadyChange,
    }) {
      const channel = client.channel(ROOM_CHANNEL, {
        config: {
          private: true,
          presence: { key: sessionId },
          broadcast: { self: false },
        },
      });
      const state: { isSubscribed: boolean } = { isSubscribed: false };
      const tracker = createPresenceTracker<RoomPresence>({
        limit: TRACK_LIMIT_WITH_SPARE,
        reservedForUrgent: 1,
        windowMs: TRACK_WINDOW_MS,
        sends,
        now: () => performance.now(),
        schedule: ({ run, delayMs }) => {
          const timer = window.setTimeout(run, delayMs);
          return () => window.clearTimeout(timer);
        },
        track: (presence) =>
          channel.track(presence).then((status) => status === "ok"),
        isUrgent: ({ presence, delivered }) =>
          (presence.writingSince === undefined) !==
          (delivered?.writingSince === undefined),
        onUrgentReadyChange,
      });
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
        .on("broadcast", { event: "clock" }, ({ payload }) => {
          const receivedAt = Date.now();
          const clock = parseRemoteClock(payload);
          if (clock !== undefined && clock.sessionId !== sessionId) {
            onClock({ clock, receivedAt });
          }
        })
        .subscribe((status) => {
          state.isSubscribed = status === "SUBSCRIBED";
          onConnectedChange(state.isSubscribed);
          tracker.setSubscribed(state.isSubscribed);
        });
      return {
        update: tracker.update,
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
        sendClock(clock) {
          if (!state.isSubscribed) return;
          void channel.send({
            type: "broadcast",
            event: "clock",
            payload: clock,
          });
        },
        leave() {
          tracker.dispose();
          void client.removeChannel(channel);
        },
      };
    },
    dispose() {
      void client.removeAllChannels();
    },
  };
}
