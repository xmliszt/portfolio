"use client";

import { useEffect, useRef, useState } from "react";

import type { createRoomEngine } from "@/lib/paws/client/create-room-engine";
import { parseJoinRoomResponse } from "@/lib/paws/client/parse-join-room-response";
import type {
  RoomConnection,
  RoomRole,
  RoomSource,
} from "@/lib/paws/room-source";
import { createFakeRoomSource } from "@/lib/paws/rooms/create-fake-room-source";
import { createSupabaseRoomSource } from "@/lib/paws/rooms/create-supabase-room-source";
import { ROOM_TIMING } from "@/lib/paws/rooms/room-timing";
import type { PawsSession } from "@/lib/paws/session-types";
import type { createPawsBrowserClient } from "@/lib/paws/supabase/create-paws-browser-client";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { postRoomApi } from "./post-room-api";

const FAKE_REMOTE_PLAYERS = 4;
const FAKE_MEOW_URL = "/paws/sounds/meow-adult-soft-chatty.mp3";
const REJOIN_DELAY_MS = 4000;

export type RoomStatus =
  | { kind: "idle" }
  | { kind: "joining" }
  | { kind: "joined"; roomId: string; role: RoomRole; isConnected: boolean }
  | { kind: "full" }
  | { kind: "failed" };

/** Join a room for the current visitor (a player when `self` is set, otherwise a watcher), feed everything it receives into `engine`, keep the membership alive, and return the room status, the open connection and the latest players. */
export function useRoomConnection(options: {
  session: PawsSession;
  client: ReturnType<typeof createPawsBrowserClient> | undefined;
  self: Omit<PlayerPresence, "joinedAt"> | undefined;
  engine: ReturnType<typeof createRoomEngine>;
  useFakeRoom: boolean;
  isReady: boolean;
}) {
  const [status, setStatus] = useState<RoomStatus>({ kind: "idle" });
  const [attempt, setAttempt] = useState(0);
  const connectionRef = useRef<RoomConnection | undefined>(undefined);
  const playersRef = useRef<PlayerPresence[]>([]);
  const tokenRef = useRef<string | undefined>(undefined);
  const { session, client, self, engine, useFakeRoom, isReady } = options;
  const userId = session.kind === "loading" ? undefined : session.userId;
  const selfKey = self === undefined ? "" : JSON.stringify(self);

  useEffect(() => {
    tokenRef.current =
      session.kind === "loading" ? undefined : session.accessToken;
  }, [session]);

  useEffect(() => {
    if (
      !isReady ||
      userId === undefined ||
      (client === undefined && !useFakeRoom)
    )
      return;
    const run: {
      isCancelled: boolean;
      heartbeat?: number;
      retry?: number;
      source?: RoomSource;
      roomId?: string;
    } = {
      isCancelled: false,
    };
    const presence =
      self === undefined ? undefined : { ...self, joinedAt: Date.now() };

    function scheduleRejoin() {
      run.retry = window.setTimeout(
        () => setAttempt((value) => value + 1),
        REJOIN_DELAY_MS
      );
    }

    async function join() {
      setStatus({ kind: "joining" });
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
            setStatus({ kind: "full" });
            scheduleRejoin();
            return undefined;
          case "tooManyJoins":
          case "forbidden":
          case "failed":
          case undefined:
            setStatus({ kind: "failed" });
            scheduleRejoin();
            return undefined;
          default: {
            const unhandled: never = answer;
            return unhandled;
          }
        }
      })();
      if (joined === undefined || run.isCancelled) return;
      run.roomId = joined.roomId;
      const source =
        useFakeRoom || client === undefined
          ? createFakeRoomSource({
              remotePlayerCount: FAKE_REMOTE_PLAYERS,
              meowUrl: FAKE_MEOW_URL,
              random: Math.random,
            })
          : createSupabaseRoomSource({
              client,
              meowOrigins: [
                new URL(
                  process.env.NEXT_PUBLIC_SUPABASE_URL ??
                    "https://invalid.local"
                ).origin,
              ],
            });
      engine.setSelf({ userId, role: joined.role });
      setStatus({
        kind: "joined",
        roomId: joined.roomId,
        role: joined.role,
        isConnected: false,
      });
      run.source = source;
      connectionRef.current = source.join({
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
        onConnectedChange: (isConnected) =>
          setStatus({
            kind: "joined",
            roomId: joined.roomId,
            role: joined.role,
            isConnected,
          }),
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
      run.source?.dispose();
      playersRef.current = [];
      engine.setPlayers([]);
      engine.setSelf({ userId: undefined, role: "watcher" });
      const token = tokenRef.current;
      if (run.roomId !== undefined && token !== undefined && !useFakeRoom) {
        void postRoomApi({
          path: "leave",
          accessToken: token,
          body: { roomId: run.roomId },
          keepalive: true,
        });
      }
      setStatus({ kind: "idle" });
    };
    // `self` is compared through `selfKey` so a new object with the same cat does not rejoin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, client, selfKey, engine, useFakeRoom, attempt, isReady]);

  return { status, connectionRef, playersRef };
}
