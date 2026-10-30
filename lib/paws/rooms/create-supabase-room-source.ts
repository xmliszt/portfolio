import type { RealtimeChannel } from "@supabase/supabase-js";

import { getChatTopic } from "@/lib/paws/chat/get-chat-topic";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { RoomSource } from "@/lib/paws/room-source";
import type { createPawsBrowserClient } from "@/lib/paws/supabase/create-paws-browser-client";
import { parseCatsMessage } from "@/lib/paws/wire/parse-cats-message";
import { parseChatMessage } from "@/lib/paws/wire/parse-chat-message";
import { parseFingerMessage } from "@/lib/paws/wire/parse-finger-message";
import { parsePlayerPresence } from "@/lib/paws/wire/parse-player-presence";
import { parseRoomEvent } from "@/lib/paws/wire/parse-room-event";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { createFingerThrottle } from "./create-finger-throttle";
import { createRateGate } from "./create-rate-gate";
import { getRoomTopic } from "./get-room-topic";

const RECEIVE_LIMITS = {
  fingersPerSecond: 10,
  catsPerSecond: 8,
  pressChangesPerSecond: 20,
  eventsPerSecond: 20,
} as const;

/** Return a room source that joins private Supabase Realtime room channels on `client`, reading players and watchers from presence and passing on only parsed messages from present visitors within `RECEIVE_LIMITS`. */
export function createSupabaseRoomSource(options: {
  client: ReturnType<typeof createPawsBrowserClient>;
  meowOrigins: string[];
}): RoomSource {
  const { client } = options;
  const shared: { lastLeave: Promise<unknown> } = {
    lastLeave: Promise.resolve(),
  };
  return {
    join({
      roomId,
      userId,
      role,
      self,
      onPlayers,
      onFinger,
      onCats,
      onEvent,
      onChat,
    }) {
      const state: {
        channel?: RealtimeChannel;
        chatChannel?: RealtimeChannel;
        isSubscribed: boolean;
        hasLeft: boolean;
        players: PlayerPresence[];
        watcherIds: string[];
        pressedByUserId: { [userId: string]: boolean };
      } = {
        isSubscribed: false,
        hasLeft: false,
        players: [],
        watcherIds: [],
        pressedByUserId: {},
      };
      const now = () => performance.now();
      const fingerGate = createRateGate({
        maxPerSecond: RECEIVE_LIMITS.fingersPerSecond,
        now,
      });
      const pressGate = createRateGate({
        maxPerSecond: RECEIVE_LIMITS.pressChangesPerSecond,
        now,
      });
      const catsGate = createRateGate({
        maxPerSecond: RECEIVE_LIMITS.catsPerSecond,
        now,
      });
      const eventGate = createRateGate({
        maxPerSecond: RECEIVE_LIMITS.eventsPerSecond,
        now,
      });
      const presence = role === "player" ? self : { role: "watcher" };
      const isPresent = (visitorId: string) =>
        state.players.some((player) => player.userId === visitorId) ||
        state.watcherIds.includes(visitorId);
      const isConnected = (connectionId: string) =>
        state.players.some((player) => player.connectionId === connectionId);

      function broadcast(event: "finger" | "cats" | "event", payload: object) {
        if (!state.isSubscribed || state.channel === undefined) return;
        void state.channel.send({ type: "broadcast", event, payload });
      }

      const fingerThrottle = createFingerThrottle({
        sendsPerSecond: ROOM_LIMITS.fingerSendsPerSecond,
        now,
        schedule: ({ run, delayMs }) => {
          const timer = window.setTimeout(run, delayMs);
          return () => window.clearTimeout(timer);
        },
        send: (finger) => broadcast("finger", finger),
      });

      function openChannel() {
        const channel = client.channel(getRoomTopic(roomId), {
          config: {
            private: true,
            broadcast: { self: false },
            presence: { key: userId },
          },
        });
        state.channel = channel;
        channel
          .on("presence", { event: "sync" }, () => {
            state.players = Object.entries(channel.presenceState()).flatMap(
              ([key, metas]) => {
                const earliest = metas
                  .flatMap((meta) => {
                    const presence = parsePlayerPresence({
                      value: meta,
                      meowOrigins: options.meowOrigins,
                    });
                    return presence === undefined || presence.userId !== key
                      ? []
                      : [presence];
                  })
                  .toSorted((a, b) => a.joinedAt - b.joinedAt)
                  .at(0);
                return earliest === undefined ? [] : [earliest];
              }
            );
            state.watcherIds = Object.entries(channel.presenceState())
              .filter(
                ([key, metas]) =>
                  !state.players.some((player) => player.userId === key) &&
                  metas.some(
                    (meta) => "role" in meta && meta.role === "watcher"
                  )
              )
              .map(([key]) => key);
            onPlayers(state.players);
          })
          .on("broadcast", { event: "finger" }, ({ payload }) => {
            const finger = parseFingerMessage(payload);
            if (finger === undefined || !isPresent(finger.userId)) return;
            const isPressChange =
              state.pressedByUserId[finger.userId] !== finger.pressed;
            const gate = isPressChange ? pressGate : fingerGate;
            if (!gate.allow(finger.userId)) return;
            state.pressedByUserId = {
              ...state.pressedByUserId,
              [finger.userId]: finger.pressed,
            };
            onFinger(finger);
          })
          .on("broadcast", { event: "cats" }, ({ payload }) => {
            const cats = parseCatsMessage(payload);
            if (
              cats !== undefined &&
              isConnected(cats.hostId) &&
              catsGate.allow(cats.hostId)
            ) {
              onCats(cats);
            }
          })
          .on("broadcast", { event: "event" }, ({ payload }) => {
            const event = parseRoomEvent(payload);
            if (
              event !== undefined &&
              isPresent(event.userId) &&
              eventGate.allow(event.userId)
            )
              onEvent(event);
          })
          .subscribe((status) => {
            state.isSubscribed = status === "SUBSCRIBED";
            if (state.isSubscribed && presence !== undefined)
              void channel.track(presence);
          });
      }

      function openChatChannel() {
        const chatChannel = client.channel(getChatTopic(roomId), {
          config: { private: true },
        });
        state.chatChannel = chatChannel;
        chatChannel
          .on("broadcast", { event: "chat" }, ({ payload }) => {
            const message = parseChatMessage(payload);
            if (
              message !== undefined &&
              state.players.some((player) => player.userId === message.userId)
            )
              onChat(message);
          })
          .subscribe();
      }

      // A channel left on the same topic is reused by the client until its removal finishes.
      void Promise.all([shared.lastLeave, client.realtime.setAuth()]).then(
        () => {
          if (state.hasLeft) return;
          openChannel();
          openChatChannel();
        }
      );

      return {
        sendFinger: fingerThrottle.push,
        sendCats: (cats) => broadcast("cats", cats),
        sendEvent: (event) => broadcast("event", event),
        leave() {
          state.hasLeft = true;
          state.isSubscribed = false;
          fingerThrottle.dispose();
          const channels = [state.channel, state.chatChannel].flatMap(
            (channel) => (channel === undefined ? [] : [channel])
          );
          shared.lastLeave = Promise.all(
            channels.map((channel) => client.removeChannel(channel))
          ).catch(() => undefined);
        },
      };
    },
    dispose() {
      void client.removeAllChannels();
    },
  };
}
