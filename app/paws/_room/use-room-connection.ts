"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { createRoomEngine } from "@/lib/paws/client/create-room-engine";
import { parseJoinRoomResponse } from "@/lib/paws/client/parse-join-room-response";
import { getBorrowedMeowUrl } from "@/lib/paws/profile/get-borrowed-meow-url";
import type { RoomConnection } from "@/lib/paws/room-source";
import { createFakeRoomSource } from "@/lib/paws/rooms/create-fake-room-source";
import { createSupabaseRoomSource } from "@/lib/paws/rooms/create-supabase-room-source";
import { ROOM_TIMING } from "@/lib/paws/rooms/room-timing";
import type { PawsSession } from "@/lib/paws/session-types";
import type { createPawsBrowserClient } from "@/lib/paws/supabase/create-paws-browser-client";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { postRoomApi } from "./post-room-api";

const FAKE_REMOTE_PLAYERS = 4;
const FAKE_VOICE = { age: "adult", voice: "soft", mood: "chatty" } as const;
const REJOIN_DELAY_MS = 4000;
const FULL_REJOIN_DELAY_MS = 30_000;

/** Join a room for the current visitor (a player when `self` is set, otherwise a watcher), feed everything it receives into `engine`, keep the membership alive, and return the open connection and the latest players. */
export function useRoomConnection(options: {
  session: PawsSession;
  client: ReturnType<typeof createPawsBrowserClient> | undefined;
  self: Omit<PlayerPresence, "joinedAt" | "connectionId"> | undefined;
  engine: ReturnType<typeof createRoomEngine>;
  useFakeRoom: boolean;
  isReady: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const connectionRef = useRef<RoomConnection | undefined>(undefined);
  const playersRef = useRef<PlayerPresence[]>([]);
  const tokenRef = useRef<string | undefined>(undefined);
  const selfRef = useRef(options.self);
  const { session, client, self, engine, useFakeRoom, isReady } = options;
  const userId = session.kind === "loading" ? undefined : session.userId;
  const selfKey = self === undefined ? "" : JSON.stringify(self);
  const source = useMemo(() => {
    if (useFakeRoom)
      return createFakeRoomSource({
        remotePlayerCount: FAKE_REMOTE_PLAYERS,
        meowUrl: getBorrowedMeowUrl(FAKE_VOICE),
        random: Math.random,
      });
    if (client === undefined) return undefined;
    return createSupabaseRoomSource({
      client,
      meowOrigins: [
        new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://invalid.local")
          .origin,
      ],
    });
  }, [client, useFakeRoom]);

  useEffect(() => () => source?.dispose(), [source]);

  useEffect(() => {
    tokenRef.current =
      session.kind === "loading" ? undefined : session.accessToken;
  }, [session]);

  useEffect(() => {
    selfRef.current = self;
  }, [self]);

  useEffect(() => {
    if (!isReady || userId === undefined || source === undefined) return;
    const roomSource = source;
    const run: {
      isCancelled: boolean;
      heartbeat?: number;
      retry?: number;
      roomId?: string;
    } = {
      isCancelled: false,
    };
    const self = selfRef.current;
    const connectionId = crypto.randomUUID();
    const presence =
      self === undefined
        ? undefined
        : { ...self, connectionId, joinedAt: Date.now() };

    function scheduleRejoin(delayMs: number) {
      run.retry = window.setTimeout(
        () => setAttempt((value) => value + 1),
        delayMs
      );
    }

    async function join() {
      const joined = await (async () => {
        if (useFakeRoom || client === undefined) {
          return {
            roomId: "local",
            role:
              presence === undefined
                ? ("watcher" as const)
                : ("player" as const),
          };
        }
        const token = tokenRef.current;
        if (token === undefined) return undefined;
        const answer = parseJoinRoomResponse(
          await postRoomApi({
            path: "join",
            accessToken: token,
            body: { wantsToPlay: presence !== undefined },
          })
        );
        if (run.isCancelled) return undefined;
        switch (answer?.kind) {
          case "joined":
            return { roomId: answer.roomId, role: answer.role };
          case "full":
            scheduleRejoin(FULL_REJOIN_DELAY_MS);
            return undefined;
          case "tooManyJoins":
          case "forbidden":
          case "failed":
          case undefined:
            scheduleRejoin(REJOIN_DELAY_MS);
            return undefined;
          default: {
            const unhandled: never = answer;
            return unhandled;
          }
        }
      })();
      if (joined === undefined || run.isCancelled) return;
      run.roomId = joined.roomId;
      engine.setSelf({ userId, connectionId, role: joined.role });
      connectionRef.current = roomSource.join({
        roomId: joined.roomId,
        role: joined.role,
        self: joined.role === "player" ? presence : undefined,
        onPlayers: (players) => {
          playersRef.current = players;
          engine.setPlayers(players);
        },
        onFinger: (message) =>
          engine.receiveFinger({ message, receivedAtMs: performance.now() }),
        onCats: (message) =>
          engine.receiveCats({ message, receivedAtMs: performance.now() }),
        onEvent: (event) => engine.receiveEvent(event),
      });
      if (useFakeRoom || client === undefined) return;
      run.heartbeat = window.setInterval(async () => {
        const token = tokenRef.current;
        if (token === undefined || run.roomId === undefined) return;
        const answer = await postRoomApi({
          path: "heartbeat",
          accessToken: token,
          body: { roomId: run.roomId },
        });
        const isGone =
          typeof answer === "object" &&
          answer !== null &&
          "kind" in answer &&
          answer.kind === "gone";
        if (isGone && !run.isCancelled) setAttempt((value) => value + 1);
      }, ROOM_TIMING.heartbeatMs);
    }

    void join();
    return () => {
      run.isCancelled = true;
      window.clearInterval(run.heartbeat);
      window.clearTimeout(run.retry);
      connectionRef.current?.leave();
      connectionRef.current = undefined;
      playersRef.current = [];
      engine.setPlayers([]);
      engine.setSelf({
        userId: undefined,
        connectionId: undefined,
        role: "watcher",
      });
      const token = tokenRef.current;
      if (run.roomId !== undefined && token !== undefined && !useFakeRoom) {
        void postRoomApi({
          path: "leave",
          accessToken: token,
          body: { roomId: run.roomId },
          keepalive: true,
        });
      }
    };
  }, [userId, client, source, selfKey, engine, useFakeRoom, attempt, isReady]);

  return { connectionRef, playersRef };
}
