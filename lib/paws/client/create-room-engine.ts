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
import { WIRE_LIMITS } from "@/lib/paws/wire/wire-limits";
import type {
  CatsMessage,
  CatSnapshot,
  FingerMessage,
  FingerPoint,
  PawPrintEvent,
  PlayerPresence,
  RoomEvent,
} from "@/lib/paws/wire-types";

import { type FingerSample, sampleFingerPath } from "./sample-finger-path";

const REMOTE_FINGER_TIMEOUT_MS = 2000;
const FINGER_REFRESH_MS = 1000;
const FINGER_SEND_MS = 1000 / ROOM_LIMITS.fingerSendsPerSecond;
const TRAIL_STEP_MS = 50;
const PLAYBACK_DELAY_MS = FINGER_SEND_MS + 150;
const KEPT_SAMPLES_MS = 1000;
const CLOCK_OFFSET_WINDOW = 10;
const MAX_CLOCK_SLEW = 0.2;
const MAX_REMOTE_SAMPLES =
  2 * CLOCK_OFFSET_WINDOW * (WIRE_LIMITS.maxTrailPoints + 1);
const MIN_FINGER_MOVE = 0.5;
const MIN_FINGERPRINT_PRESS = 0.2;
const RESIDENT_CATS = 3;
const LOCAL_VISITOR_ID = "visitor";
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
  userId: string;
  samples: FingerSample[];
  lastSeq: number;
  clockOffsets: number[];
  clockOffset: number | undefined;
  receivedAtMs: number;
  pressed: boolean;
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
    ownTrail: FingerPoint[];
    wasPressed: boolean;
    seq: number;
    prints: ScenePrint[];
    received: { event: RoomEvent; showAtMs: number }[];
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
    ownTrail: [],
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
              userId: finger.userId,
              x: finger.tip.x,
              y: finger.tip.y,
              pressed: finger.pressed,
            },
          ]
    );
    const own = state.ownPointer.present
      ? [
          {
            userId: state.selfId ?? LOCAL_VISITOR_ID,
            x: state.ownPointer.x,
            y: state.ownPointer.y,
            pressed: state.ownPointer.pressed,
          },
        ]
      : [];
    return [...own, ...remote];
  }

  function recordOwnTrail(nowMs: number) {
    if (!state.ownPointer.present) {
      state.ownTrail = [];
      return;
    }
    const last = state.ownTrail.at(-1);
    if (last !== undefined && nowMs - last[2] < TRAIL_STEP_MS) return;
    state.ownTrail = [
      ...state.ownTrail,
      [
        state.ownPointer.x,
        state.ownPointer.y,
        Math.round(nowMs),
      ] satisfies FingerPoint,
    ].slice(-WIRE_LIMITS.maxTrailPoints);
  }

  function ownFingerMessage(nowMs: number): FingerMessage | undefined {
    if (state.selfId === undefined) return undefined;
    const last = state.lastSentFinger;
    const t = Math.round(nowMs);
    if (!state.ownPointer.present) {
      state.lastSentFinger = undefined;
      if (last === undefined || !last.pressed) return undefined;
      state.seq += 1;
      return {
        userId: state.selfId,
        x: last.x,
        y: last.y,
        t,
        trail: [],
        pressed: false,
        seq: state.seq,
      };
    }
    const { x, y, pressed } = state.ownPointer;
    const isDue =
      last === undefined ||
      last.pressed !== pressed ||
      nowMs - last.sentAtMs >= FINGER_REFRESH_MS ||
      (nowMs - last.sentAtMs >= FINGER_SEND_MS &&
        Math.hypot(x - last.x, y - last.y) > MIN_FINGER_MOVE);
    if (!isDue) return undefined;
    const trail = state.ownTrail.filter(
      (point) =>
        point[2] < t && (last === undefined || point[2] > last.sentAtMs)
    );
    state.lastSentFinger = { x, y, pressed, sentAtMs: t };
    state.seq += 1;
    return { userId: state.selfId, x, y, t, trail, pressed, seq: state.seq };
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
    return {
      kind: "fingerPrint",
      userId: state.selfId ?? LOCAL_VISITOR_ID,
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
      const { message, receivedAtMs } = options;
      const existing = state.remoteFingers[message.userId];
      if (existing !== undefined && message.seq === existing.lastSeq) return;
      const stream =
        existing !== undefined && message.seq > existing.lastSeq
          ? existing
          : undefined;
      const previous = stream?.samples.at(-1);
      const arrived: FingerSample[] = [
        ...message.trail.map(([x, y, t]) => ({
          x,
          y,
          t,
          pressed: previous?.pressed ?? message.pressed,
        })),
        { x: message.x, y: message.y, t: message.t, pressed: message.pressed },
      ].filter((sample) => previous === undefined || sample.t > previous.t);
      state.remoteFingers[message.userId] = {
        userId: message.userId,
        samples: [...(stream?.samples ?? []), ...arrived].slice(
          -MAX_REMOTE_SAMPLES
        ),
        lastSeq: message.seq,
        clockOffsets: [
          ...(stream?.clockOffsets ?? []),
          receivedAtMs - message.t,
        ].slice(-CLOCK_OFFSET_WINDOW),
        clockOffset: stream?.clockOffset,
        receivedAtMs,
        pressed: stream?.pressed ?? message.pressed,
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
    receiveEvent: (options: { event: RoomEvent; receivedAtMs: number }) => {
      state.received = [
        ...state.received,
        {
          event: options.event,
          showAtMs:
            options.event.kind === "fingerPrint"
              ? options.receivedAtMs + PLAYBACK_DELAY_MS
              : options.receivedAtMs,
        },
      ].slice(-MAX_QUEUED_EVENTS);
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

      const events: RoomEvent[] = state.received
        .filter((received) => received.showAtMs <= nowMs)
        .map((received) => received.event);
      state.received = state.received.filter(
        (received) => received.showAtMs > nowMs
      );
      const stepped: {
        snapshots: CatSnapshot[];
        cats: CatsMessage | undefined;
        events: RoomEvent[];
      } = (() => {
        if (state.world === undefined && state.residents !== undefined) {
          const result = stepWorld({
            world: state.residents.world,
            players: state.residents.players,
            fingers: simFingers(nowMs),
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
      recordOwnTrail(nowMs);
      const fingerprint = ownFingerprint();
      if (fingerprint !== undefined) events.push(fingerprint);
      const outgoingEvents =
        fingerprint === undefined
          ? stepped.events
          : [...stepped.events, fingerprint];
      for (const [userId, finger] of Object.entries(state.remoteFingers)) {
        if (finger === undefined) continue;
        const isFresh = nowMs - finger.receivedAtMs <= REMOTE_FINGER_TIMEOUT_MS;
        const targetOffset = Math.min(...finger.clockOffsets);
        const slew = MAX_CLOCK_SLEW * dtSeconds * 1000;
        finger.clockOffset =
          finger.clockOffset === undefined
            ? targetOffset
            : finger.clockOffset +
              Math.min(
                slew,
                Math.max(-slew, targetOffset - finger.clockOffset)
              );
        const playAt = nowMs - finger.clockOffset - PLAYBACK_DELAY_MS;
        const point = sampleFingerPath({ samples: finger.samples, t: playAt });
        const keepFrom = finger.samples.findLastIndex(
          (sample) => sample.t < playAt - KEPT_SAMPLES_MS
        );
        finger.samples = finger.samples.slice(Math.max(0, keepFrom));
        finger.pressed = point?.pressed ?? false;
        finger.tip = stepFingertip({
          fingertip: finger.tip,
          input: {
            x: point?.x ?? finger.tip?.x ?? 0,
            y: point?.y ?? finger.tip?.y ?? 0,
            present: isFresh,
            pressed: finger.pressed,
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
      const fingers: SceneFinger[] = [
        ...Object.values(state.remoteFingers).flatMap((finger) =>
          finger?.tip === undefined
            ? []
            : [
                {
                  ...finger.tip,
                  kind: "remote" as const,
                  userId: finger.userId,
                },
              ]
        ),
        {
          ...state.ownTip,
          kind: "own",
          userId: state.selfId ?? LOCAL_VISITOR_ID,
        },
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
