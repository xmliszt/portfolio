import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { pruneScenePrints } from "@/lib/paws/render/prune-scene-prints";
import type {
  FingertipState,
  SceneFinger,
  ScenePrint,
} from "@/lib/paws/render/render-types";
import { stepFingertip } from "@/lib/paws/render/step-fingertip";
import { toScenePrint } from "@/lib/paws/render/to-scene-print";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { RoomRole } from "@/lib/paws/room-source";
import { chooseHost } from "@/lib/paws/rooms/choose-host";
import { createSnapshotBuffer } from "@/lib/paws/sim/create-snapshot-buffer";
import { createWorld } from "@/lib/paws/sim/create-world";
import { createWorldFromSnapshots } from "@/lib/paws/sim/create-world-from-snapshots";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { deriveCat } from "@/lib/paws/sim/derive-cat";
import { getCatSnapshots } from "@/lib/paws/sim/get-cat-snapshots";
import type { FingerInput, World } from "@/lib/paws/sim/sim-types";
import { stepWorld } from "@/lib/paws/sim/step-world";
import type {
  CatsMessage,
  CatSnapshot,
  FingerMessage,
  PawPrintEvent,
  PlayerPresence,
  RoomEvent,
} from "@/lib/paws/wire-types";

const REMOTE_FINGER_TIMEOUT_MS = 2000;
const FINGER_REFRESH_MS = 1000;
const MIN_FINGER_MOVE = 0.5;
const MIN_FINGERPRINT_PRESS = 0.2;
const RESIDENT_CATS = 3;
const MAX_QUEUED_PRINTS = 160;
const MAX_QUEUED_EVENTS = 200;

export type OwnPointer = {
  x: number;
  y: number;
  present: boolean;
  pressed: boolean;
};

export type RoomFrame = {
  time: number;
  cats: DerivedCat[];
  prints: ScenePrint[];
  fingers: SceneFinger[];
  sounds: Extract<RoomEvent, { kind: "sound" }>[];
  outgoing: {
    cats: CatsMessage | undefined;
    events: RoomEvent[];
    finger: FingerMessage | undefined;
  };
  isHost: boolean;
};

type RemoteFinger = {
  message: FingerMessage;
  receivedAtMs: number;
  tip: FingertipState | undefined;
};

/** Return the room as one screen runs it: the host steps the shared cats and the others play back the host's snapshots, both turning fingertips, prints and sounds into what to draw, play and send each frame. */
export function createRoomEngine(options: { random: () => number }) {
  const state: {
    players: PlayerPresence[];
    selfId: string | undefined;
    selfConnectionId: string | undefined;
    role: RoomRole;
    world: World | undefined;
    residents:
      | { world: World; players: Pick<PlayerPresence, "userId" | "look">[] }
      | undefined;
    buffer: ReturnType<typeof createSnapshotBuffer>;
    remoteFingers: { [userId: string]: RemoteFinger | undefined };
    ownPointer: OwnPointer;
    ownTip: FingertipState | undefined;
    lastSentFinger:
      | { x: number; y: number; pressed: boolean; sentAtMs: number }
      | undefined;
    wasPressed: boolean;
    seq: number;
    prints: ScenePrint[];
    received: RoomEvent[];
    unsentPrints: PawPrintEvent[];
    incomingPrints: { print: PawPrintEvent; showAtMs: number }[];
    lastCatsSentAtMs: number;
    time: number;
  } = {
    players: [],
    selfId: undefined,
    selfConnectionId: undefined,
    role: "watcher",
    world: undefined,
    residents: undefined,
    buffer: createSnapshotBuffer(),
    remoteFingers: {},
    ownPointer: { x: 0, y: 0, present: false, pressed: false },
    ownTip: undefined,
    lastSentFinger: undefined,
    wasPressed: false,
    seq: 0,
    prints: [],
    received: [],
    unsentPrints: [],
    incomingPrints: [],
    lastCatsSentAtMs: -Infinity,
    time: 0,
  };

  function lookOf(userId: string) {
    const players = [...state.players, ...(state.residents?.players ?? [])];
    return players.find((player) => player.userId === userId)?.look;
  }

  function addPrint(event: RoomEvent) {
    const print = toScenePrint({
      event,
      look: "userId" in event ? lookOf(event.userId) : undefined,
      time: state.time,
    });
    if (print !== undefined) state.prints = [...state.prints, print];
  }

  function simFingers(nowMs: number): FingerInput[] {
    const remote = Object.values(state.remoteFingers).flatMap((finger) =>
      finger === undefined ||
      finger.tip === undefined ||
      nowMs - finger.receivedAtMs > REMOTE_FINGER_TIMEOUT_MS
        ? []
        : [
            {
              userId: finger.message.userId,
              x: finger.tip.x,
              y: finger.tip.y,
              pressed: finger.message.pressed,
            },
          ]
    );
    const own =
      state.role === "player" &&
      state.selfId !== undefined &&
      state.ownPointer.present
        ? [
            {
              userId: state.selfId,
              x: state.ownPointer.x,
              y: state.ownPointer.y,
              pressed: state.ownPointer.pressed,
            },
          ]
        : [];
    return [...own, ...remote];
  }

  function ownFingerMessage(nowMs: number): FingerMessage | undefined {
    if (state.role !== "player" || state.selfId === undefined) return undefined;
    const last = state.lastSentFinger;
    if (!state.ownPointer.present) {
      state.lastSentFinger = undefined;
      if (last === undefined || !last.pressed) return undefined;
      state.seq += 1;
      return {
        userId: state.selfId,
        x: last.x,
        y: last.y,
        pressed: false,
        seq: state.seq,
      };
    }
    const { x, y, pressed } = state.ownPointer;
    const isUnchanged =
      last !== undefined &&
      Math.hypot(x - last.x, y - last.y) <= MIN_FINGER_MOVE &&
      last.pressed === pressed &&
      nowMs - last.sentAtMs < FINGER_REFRESH_MS;
    if (isUnchanged) return undefined;
    state.lastSentFinger = { x, y, pressed, sentAtMs: nowMs };
    state.seq += 1;
    return { userId: state.selfId, x, y, pressed, seq: state.seq };
  }

  function ownFingerprint(): RoomEvent | undefined {
    const released = state.wasPressed && !state.ownPointer.pressed;
    state.wasPressed = state.ownPointer.pressed;
    if (
      !released ||
      state.ownTip === undefined ||
      state.ownTip.press < MIN_FINGERPRINT_PRESS
    )
      return undefined;
    if (state.role !== "player" || state.selfId === undefined) return undefined;
    return {
      kind: "fingerPrint",
      userId: state.selfId,
      x: state.ownTip.x,
      y: state.ownTip.y,
      pressure: state.ownTip.press,
    };
  }

  return {
    setPlayers: (players: PlayerPresence[]) => {
      state.players = players;
    },
    setSelf: (self: {
      userId: string | undefined;
      connectionId: string | undefined;
      role: RoomRole;
    }) => {
      state.selfId = self.userId;
      state.selfConnectionId = self.connectionId;
      state.role = self.role;
    },
    setOwnPointer: (pointer: OwnPointer) => {
      state.ownPointer = pointer;
    },
    receiveFinger: (options: {
      message: FingerMessage;
      receivedAtMs: number;
    }) => {
      const existing = state.remoteFingers[options.message.userId];
      state.remoteFingers[options.message.userId] = {
        message: options.message,
        receivedAtMs: options.receivedAtMs,
        tip: existing?.tip,
      };
    },
    receiveCats: (options: { message: CatsMessage; receivedAtMs: number }) => {
      const hostId = chooseHost(state.players);
      if (
        options.message.hostId === state.selfConnectionId ||
        options.message.hostId !== hostId
      )
        return;
      state.buffer.push(options);
      state.incomingPrints = [
        ...state.incomingPrints,
        ...options.message.prints.map((print) => ({
          print,
          showAtMs: options.receivedAtMs + ROOM_LIMITS.renderDelayMs,
        })),
      ].slice(-MAX_QUEUED_PRINTS);
    },
    receiveEvent: (event: RoomEvent) => {
      state.received = [...state.received, event].slice(-MAX_QUEUED_EVENTS);
    },
    /** Advance the room by `dtSeconds` at local time `nowMs` and return what to draw, play and send. */
    frame: (frameOptions: { nowMs: number; dtSeconds: number }): RoomFrame => {
      const { nowMs, dtSeconds } = frameOptions;
      state.time += dtSeconds;
      const hostId = chooseHost(state.players);
      const isHost =
        state.role === "player" &&
        state.selfConnectionId !== undefined &&
        hostId === state.selfConnectionId;

      if (isHost && state.world === undefined) {
        const latest = state.buffer.latest();
        state.world =
          latest.length > 0
            ? createWorldFromSnapshots({
                random: options.random,
                snapshots: latest,
                players: state.players,
              })
            : createWorld({ random: options.random });
      }
      if (!isHost) {
        state.world = undefined;
        state.unsentPrints = [];
      }
      if (isHost || hostId === undefined) state.incomingPrints = [];
      if (hostId !== undefined) state.residents = undefined;
      if (hostId === undefined && state.residents === undefined) {
        state.residents = {
          world: createWorld({ random: options.random }),
          players: Array.from({ length: RESIDENT_CATS }, (_, index) => ({
            userId: `resident-${index + 1}`,
            look: shuffleCatLook({ random: options.random }),
          })),
        };
      }

      const events: RoomEvent[] = [...state.received];
      state.received = [];
      const stepped: {
        snapshots: CatSnapshot[];
        cats: CatsMessage | undefined;
        events: RoomEvent[];
      } = (() => {
        if (state.world === undefined && state.residents !== undefined) {
          const result = stepWorld({
            world: state.residents.world,
            players: state.residents.players,
            fingers: [],
            dtSeconds,
          });
          events.push(...result.events);
          return {
            snapshots: getCatSnapshots(state.residents.world),
            cats: undefined,
            events: [],
          };
        }
        if (state.world === undefined) {
          const due = state.incomingPrints.filter(
            (incoming) => incoming.showAtMs <= nowMs
          );
          state.incomingPrints = state.incomingPrints.filter(
            (incoming) => incoming.showAtMs > nowMs
          );
          events.push(...due.map((incoming) => incoming.print));
          return {
            snapshots: state.buffer.sample({ nowMs }),
            cats: undefined,
            events: [],
          };
        }
        const result = stepWorld({
          world: state.world,
          players: state.players,
          fingers: simFingers(nowMs),
          dtSeconds,
        });
        events.push(...result.events);
        state.unsentPrints = [
          ...state.unsentPrints,
          ...result.events.filter(
            (event): event is PawPrintEvent => event.kind === "pawPrint"
          ),
        ];
        const current = getCatSnapshots(state.world);
        const isDue =
          nowMs - state.lastCatsSentAtMs >=
          1000 / ROOM_LIMITS.catSnapshotsPerSecond;
        const cats =
          isDue && state.selfConnectionId !== undefined
            ? {
                hostId: state.selfConnectionId,
                sentAt: Date.now(),
                cats: current,
                prints: state.unsentPrints,
              }
            : undefined;
        if (cats !== undefined) {
          state.lastCatsSentAtMs = nowMs;
          state.unsentPrints = [];
        }
        return {
          snapshots: current,
          cats,
          events: result.events.filter((event) => event.kind !== "pawPrint"),
        };
      })();
      const snapshots = stepped.snapshots;

      state.ownTip = stepFingertip({
        fingertip: state.ownTip,
        input: state.ownPointer,
        dtSeconds,
      });
      const fingerprint = ownFingerprint();
      if (fingerprint !== undefined) events.push(fingerprint);
      const outgoingEvents =
        fingerprint === undefined
          ? stepped.events
          : [...stepped.events, fingerprint];
      for (const [userId, finger] of Object.entries(state.remoteFingers)) {
        if (finger === undefined) continue;
        const isFresh = nowMs - finger.receivedAtMs <= REMOTE_FINGER_TIMEOUT_MS;
        finger.tip = stepFingertip({
          fingertip: finger.tip,
          input: {
            x: finger.message.x,
            y: finger.message.y,
            present: isFresh,
            pressed: finger.message.pressed,
          },
          dtSeconds,
        });
        if (!isFresh && finger.tip.visibility < 0.01)
          state.remoteFingers[userId] = undefined;
      }

      for (const event of events) addPrint(event);
      state.prints = pruneScenePrints({
        prints: state.prints,
        time: state.time,
      });

      const cats = snapshots.flatMap((snapshot) => {
        const look = lookOf(snapshot.userId);
        return look === undefined
          ? []
          : [deriveCat({ snapshot, look, time: state.time })];
      });
      const ownKind = state.role === "player" ? "own" : "watchOnly";
      const fingers: SceneFinger[] = [
        ...Object.values(state.remoteFingers).flatMap((finger) =>
          finger?.tip === undefined
            ? []
            : [{ ...finger.tip, kind: "remote" as const }]
        ),
        { ...state.ownTip, kind: ownKind },
      ];
      return {
        time: state.time,
        cats,
        prints: state.prints,
        fingers,
        sounds: events.filter(
          (event): event is Extract<RoomEvent, { kind: "sound" }> =>
            event.kind === "sound"
        ),
        outgoing: {
          cats: stepped.cats,
          events: outgoingEvents,
          finger: ownFingerMessage(nowMs),
        },
        isHost,
      };
    },
  };
}
