"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { createRoomEngine } from "@/lib/paws/client/create-room-engine";
import { parseJoinRoomResponse } from "@/lib/paws/client/parse-join-room-response";
import type { RoomConnection } from "@/lib/paws/room-source";
import { createFakeRoomSource } from "@/lib/paws/rooms/create-fake-room-source";
import { createSupabaseRoomSource } from "@/lib/paws/rooms/create-supabase-room-source";
import { LOCAL_ROOM_ID } from "@/lib/paws/rooms/local-room-id";
import { ROOM_TIMING } from "@/lib/paws/rooms/room-timing";
import type { PawsSession } from "@/lib/paws/session-types";
import type { createPawsBrowserClient } from "@/lib/paws/supabase/create-paws-browser-client";
import type { ChatMessage, PlayerPresence } from "@/lib/paws/wire-types";

import { postRoomApi } from "./post-room-api";

const FAKE_REMOTE_PLAYERS = 4;
const REJOIN_DELAY_MS = 4000;
const FULL_REJOIN_DELAY_MS = 30_000;

/** Join a room for the current visitor (a player when `self` is set, otherwise a watcher), asking for the `?room=` room or the one passed to `switchRoom` when there is one, and otherwise for the room it was last in, feed everything it receives into `engine`, keep the membership alive, and return the open connection, the latest players, the room id, whether every room was full on the last try, and `switchRoom`. */
export function useRoomConnection(options: {
  session: PawsSession;
  client: ReturnType<typeof createPawsBrowserClient> | undefined;
  self: Omit<PlayerPresence, "joinedAt" | "connectionId"> | undefined;
  engine: ReturnType<typeof createRoomEngine>;
  useFakeRoom: boolean;
  isReady: boolean;
  onChat: (message: ChatMessage) => void;
}) {
  const [attempt, setAttempt] = useState(0);
  const [chosenRoomId, setChosenRoomId] = useState<string | undefined>(() =>
    typeof window === "undefined"
      ? undefined
      : (new URLSearchParams(window.location.search).get("room") ?? undefined)
  );
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [isFull, setIsFull] = useState(false);
  const connectionRef = useRef<RoomConnection | undefined>(undefined);
  const roomIdRef = useRef<string | undefined>(undefined);
  const lastRoomIdRef = useRef<string | undefined>(undefined);
  const pendingLeaveRef = useRef<Promise<unknown>>(Promise.resolve());
  const onChatRef = useRef(options.onChat);
  const playersRef = useRef<PlayerPresence[]>([]);
  const tokenRef = useRef<string | undefined>(undefined);
  const selfRef = useRef(options.self);
  const { session, client, self, engine, useFakeRoom, isReady } = options;
  const userId = "userId" in session ? session.userId : undefined;
  const selfKey = self === undefined ? "" : JSON.stringify(self);
  const source = useMemo(() => {
    if (useFakeRoom)
      return createFakeRoomSource({
        remotePlayerCount: FAKE_REMOTE_PLAYERS,
        random: Math.random,
      });
    if (client === undefined) return undefined;
    return createSupabaseRoomSource({ client });
  }, [client, useFakeRoom]);

  useEffect(() => () => source?.dispose(), [source]);

  useEffect(() => {
    tokenRef.current =
      "accessToken" in session ? session.accessToken : undefined;
  }, [session]);

  useEffect(() => {
    selfRef.current = self;
  }, [self]);

  useEffect(() => {
    onChatRef.current = options.onChat;
  }, [options.onChat]);

  useEffect(() => {
    if (!isReady || userId === undefined || source === undefined) return;
    const roomSource = source;
    const visitorId = userId;
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
            roomId: LOCAL_ROOM_ID,
            role:
              presence === undefined
                ? ("watcher" as const)
                : ("player" as const),
          };
        }
        await pendingLeaveRef.current;
        const token = tokenRef.current;
        if (token === undefined || run.isCancelled) return undefined;
        const preferredRoomId = chosenRoomId ?? lastRoomIdRef.current;
        const answer = parseJoinRoomResponse(
          await postRoomApi({
            path: "join",
            accessToken: token,
            body: {
              wantsToPlay: presence !== undefined,
              ...(preferredRoomId === undefined
                ? {}
                : { roomId: preferredRoomId }),
            },
          })
        );
        if (run.isCancelled) return undefined;
        switch (answer?.kind) {
          case "joined":
            return { roomId: answer.roomId, role: answer.role };
          case "full":
            setIsFull(true);
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
      setIsFull(false);
      roomIdRef.current = joined.roomId;
      lastRoomIdRef.current = joined.roomId;
      setRoomId(joined.roomId);
      engine.setSelf({
        userId,
        connectionId,
        role: joined.role,
        roomId: joined.roomId,
      });
      connectionRef.current = roomSource.join({
        roomId: joined.roomId,
        userId: visitorId,
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
        onEvent: (event) =>
          engine.receiveEvent({ event, receivedAtMs: performance.now() }),
        onChat: (message) => onChatRef.current(message),
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
        const kind =
          typeof answer === "object" && answer !== null && "kind" in answer
            ? answer.kind
            : undefined;
        const isMoving = kind === "move" && chosenRoomId === undefined;
        if ((kind === "gone" || isMoving) && !run.isCancelled) {
          if (isMoving) lastRoomIdRef.current = undefined;
          setAttempt((value) => value + 1);
        }
      }, ROOM_TIMING.heartbeatMs);
    }

    void join();
    return () => {
      run.isCancelled = true;
      window.clearInterval(run.heartbeat);
      window.clearTimeout(run.retry);
      connectionRef.current?.leave();
      connectionRef.current = undefined;
      roomIdRef.current = undefined;
      setRoomId(undefined);
      playersRef.current = [];
      engine.setPlayers([]);
      engine.setSelf({
        userId: undefined,
        connectionId: undefined,
        role: "watcher",
        roomId: undefined,
      });
      const token = tokenRef.current;
      if (run.roomId !== undefined && token !== undefined && !useFakeRoom) {
        pendingLeaveRef.current = postRoomApi({
          path: "leave",
          accessToken: token,
          body: { roomId: run.roomId },
          keepalive: true,
        });
      }
    };
  }, [
    userId,
    client,
    source,
    selfKey,
    engine,
    useFakeRoom,
    attempt,
    isReady,
    chosenRoomId,
  ]);

  function switchRoom(nextRoomId: string) {
    setChosenRoomId(nextRoomId);
    setAttempt((value) => value + 1);
  }

  return { connectionRef, playersRef, roomIdRef, roomId, isFull, switchRoom };
}
