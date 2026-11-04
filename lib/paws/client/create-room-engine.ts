import { pruneScenePrints } from "@/lib/paws/render/prune-scene-prints";
import type {
  FingertipState,
  SceneFinger,
  ScenePrint,
} from "@/lib/paws/render/render-types";
import { stepFingertip } from "@/lib/paws/render/step-fingertip";
import { toScenePrint } from "@/lib/paws/render/to-scene-print";
import type { ToyMarks } from "@/lib/paws/render/toy-marks";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { RoomRole } from "@/lib/paws/room-source";
import { chooseHost } from "@/lib/paws/rooms/choose-host";
import { LOCAL_ROOM_ID } from "@/lib/paws/rooms/local-room-id";
import { createResidentWorld } from "@/lib/paws/sim/create-resident-world";
import { createSnapshotBuffer } from "@/lib/paws/sim/create-snapshot-buffer";
import { createToys } from "@/lib/paws/sim/create-toys";
import { createWorldFromSnapshots } from "@/lib/paws/sim/create-world-from-snapshots";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { deriveCat } from "@/lib/paws/sim/derive-cat";
import { getCatSnapshots } from "@/lib/paws/sim/get-cat-snapshots";
import { getToySnapshots } from "@/lib/paws/sim/get-toy-snapshots";
import { getToyTrails } from "@/lib/paws/sim/get-toy-trails";
import { isInPuddle } from "@/lib/paws/sim/is-in-puddle";
import { placeToy } from "@/lib/paws/sim/place-toy";
import type { FingerInput, World } from "@/lib/paws/sim/sim-types";
import { stepWorld } from "@/lib/paws/sim/step-world";
import type { ToyItemId } from "@/lib/paws/sim/toy-items";
import { WIRE_LIMITS } from "@/lib/paws/wire/wire-limits";
import type {
  CatsMessage,
  CatSnapshot,
  FingerMessage,
  FingerPoint,
  PawPrintEvent,
  PlayerPresence,
  RoomEvent,
  ToySnapshot,
  ToyTrail,
} from "@/lib/paws/wire-types";

import { createLegPlayer } from "./create-leg-player";
import { createToyMarks } from "./create-toy-marks";
import { getResidentCats } from "./get-resident-cats";
import { type FingerSample, sampleFingerPath } from "./sample-finger-path";

const REMOTE_FINGER_TIMEOUT_MS = 2000;
const FINGER_REFRESH_MS = 1000;
const FINGER_SEND_MS = 1000 / ROOM_LIMITS.fingerSendsPerSecond;
const TRAIL_STEP_MS = 50;
const PLAYBACK_DELAY_MS = FINGER_SEND_MS + 150;
const KEPT_SAMPLES_MS = 1000;
const CLOCK_OFFSET_WINDOW = 10;
const MAX_CLOCK_SLEW = 0.2;
/** World units a late batch must move a held fingertip in one frame for playback to resume from where it held. */
const CATCH_UP_JUMP = 24;
/** Milliseconds between two samples beyond which they belong to different strokes, such as a lift and a new touch, and playback steps between them instead of gliding. */
const STROKE_GAP_MS = 3 * TRAIL_STEP_MS;
const MAX_CATCH_UP_MS = 3000;
const MAX_REMOTE_SAMPLES =
  2 * CLOCK_OFFSET_WINDOW * (WIRE_LIMITS.maxTrailPoints + 1);
const MIN_FINGER_MOVE = 0.5;
const MIN_FINGERPRINT_PRESS = 0.2;
const LOCAL_VISITOR_ID = "visitor";
const SILENT_HOST_MS = 3000;
/** How long a screen that enters a room listens for a host already running it before it starts the room itself. */
const LISTEN_MS = 1000;
const MAX_QUEUED_PRINTS = 160;
const MAX_QUEUED_EVENTS = 200;
const TRAILS_SEND_MS = 1000;
const PENDING_PLACE_MS = 3000;
/** How long after a wet print, and how close to it in world units, a paw print from the same step is dropped so the step leaves only the wet print. */
const WET_STEP_SECONDS = 1;
const WET_STEP_GAP = 3;

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
  toys: ToySnapshot[];
  trails: ToyTrail[];
  toyMarks: ToyMarks;
  /** Toys this screen asked the host to place that have not shown up in the room yet. */
  pendingItemIds: ToyItemId[];
  sounds: Extract<RoomEvent, { kind: "sound" }>[];
  residents: Resident[];
  outgoing: {
    cats: CatsMessage | undefined;
    events: RoomEvent[];
    finger: FingerMessage | undefined;
  };
  isHost: boolean;
};

type Resident = ReturnType<typeof getResidentCats>[number];

type RemoteFinger = {
  userId: string;
  samples: FingerSample[];
  lastSeq: number;
  clockOffsets: number[];
  clockOffset: number | undefined;
  receivedAtMs: number;
  pressed: boolean;
  tip: FingertipState | undefined;
  /** The newest sample's time while playback has run past it, or `undefined` while playback is inside the samples. */
  heldAt: number | undefined;
  /** The sample time playback showed last frame. */
  playedAt: number | undefined;
  /** `true` when last frame's playback crossed into a new stroke. */
  jumped: boolean;
};

/** Return the room as one screen runs it: the host steps the shared cats and the others play back the host's snapshots, both turning fingertips, prints and sounds into what to draw, play and send each frame. */
export function createRoomEngine(options: { random: () => number }) {
  const state: {
    players: PlayerPresence[];
    selfId: string | undefined;
    selfConnectionId: string | undefined;
    role: RoomRole;
    world: World | undefined;
    /** The world this screen last hosted in this room, and when it stopped hosting it. */
    hostedWorld: { world: World; stoppedAtMs: number } | undefined;
    roomId: string | undefined;
    residents: Resident[];
    residentWorld: World | undefined;
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
    lastTrailsSentAtMs: number;
    sentToyIds: string;
    lastCatsReceivedAtMs: number;
    placements: { itemId: ToyItemId; x: number; y: number }[];
    pending: { itemId: ToyItemId; untilMs: number }[];
    followed: { hostId: string | undefined; sinceMs: number };
    hasSyncedPresence: boolean;
    enteredAtMs: number | undefined;
    guestHost: { connectionId: string; heardAtMs: number } | undefined;
    heardPlayerHostId: string | undefined;
    time: number;
  } = {
    players: [],
    selfId: undefined,
    selfConnectionId: undefined,
    role: "watcher",
    world: undefined,
    hostedWorld: undefined,
    roomId: undefined,
    residents: getResidentCats({ roomId: LOCAL_ROOM_ID }),
    residentWorld: undefined,
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
    lastTrailsSentAtMs: -Infinity,
    sentToyIds: "",
    lastCatsReceivedAtMs: -Infinity,
    placements: [],
    pending: [],
    followed: { hostId: undefined, sinceMs: 0 },
    hasSyncedPresence: false,
    enteredAtMs: undefined,
    guestHost: undefined,
    heardPlayerHostId: undefined,
    time: 0,
  };
  const legPlayer = createLegPlayer({ random: options.random });
  const toyMarks = createToyMarks();

  function lookOf(userId: string) {
    const players = [...state.players, ...state.residents];
    return players.find((player) => player.userId === userId)?.look;
  }

  function carryOnWorld(players: {
    known: Pick<PlayerPresence, "userId" | "look">[];
    fresh: Pick<PlayerPresence, "userId" | "look">[];
  }) {
    const latest = state.buffer.latest();
    const toys = state.buffer.latestToys();
    const trails = state.buffer.latestTrails();
    if (latest.length === 0)
      return createResidentWorld({
        random: options.random,
        players: players.fresh,
        toys: toys.length > 0 ? toys : undefined,
        trails,
      });
    return createWorldFromSnapshots({
      random: options.random,
      snapshots: latest,
      players: players.known,
      toys:
        toys.length > 0
          ? toys
          : createToys({
              random: options.random,
              world: {
                width: ROOM_LIMITS.worldWidth,
                height: ROOM_LIMITS.worldHeight,
              },
            }),
      trails,
    });
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
              jumped: finger.jumped,
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
      state.hasSyncedPresence = true;
    },
    setSelf: (self: {
      userId: string | undefined;
      connectionId: string | undefined;
      role: RoomRole;
      roomId: string | undefined;
    }) => {
      if (self.roomId !== undefined && self.roomId !== state.roomId) {
        state.roomId = self.roomId;
        state.residents = getResidentCats({ roomId: self.roomId });
        state.residentWorld = undefined;
        state.hostedWorld = undefined;
        state.buffer = createSnapshotBuffer();
        state.lastCatsReceivedAtMs = -Infinity;
        legPlayer.reset();
        toyMarks.reset();
        state.placements = [];
        state.pending = [];
      }
      if (self.roomId === undefined) state.hasSyncedPresence = false;
      if (
        self.roomId === undefined ||
        self.roomId !== state.roomId ||
        self.connectionId !== state.selfConnectionId
      ) {
        state.enteredAtMs = undefined;
        state.guestHost = undefined;
        state.heardPlayerHostId = undefined;
      }
      state.selfId = self.userId;
      state.selfConnectionId = self.connectionId;
      state.role = self.role;
    },
    setOwnPointer: (pointer: OwnPointer) => {
      state.ownPointer = pointer;
    },
    /** Bring the toy `itemId` into the room at `x`, `y` on the next frame: straight into the world this screen runs, or as a request to the host. */
    placeToy: (placement: {
      itemId: ToyItemId;
      x: number;
      y: number;
      nowMs: number;
    }) => {
      const { itemId, x, y } = placement;
      state.placements = [...state.placements, { itemId, x, y }];
      state.pending = [
        ...state.pending,
        { itemId, untilMs: placement.nowMs + PENDING_PLACE_MS },
      ];
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
        heldAt: stream?.heldAt,
        playedAt: stream?.playedAt,
        jumped: stream?.jumped ?? false,
      };
    },
    receiveCats: (options: { message: CatsMessage; receivedAtMs: number }) => {
      const { hostId } = options.message;
      const playerHostId = chooseHost(state.players);
      const self = state.selfConnectionId;
      if (hostId === self) return;
      if (state.players.some((player) => player.connectionId === hostId)) {
        if (hostId !== playerHostId) return;
        state.heardPlayerHostId = hostId;
      } else {
        const guestHost = state.guestHost;
        const isPlayerHostHeard =
          playerHostId !== undefined &&
          state.heardPlayerHostId === playerHostId;
        const outranksSender =
          state.world !== undefined &&
          (state.role === "player" || (self !== undefined && self < hostId));
        const isOutrankedByGuestHost =
          guestHost !== undefined &&
          options.receivedAtMs - guestHost.heardAtMs <= SILENT_HOST_MS &&
          guestHost.connectionId < hostId;
        if (isPlayerHostHeard || outranksSender || isOutrankedByGuestHost)
          return;
        state.guestHost = {
          connectionId: hostId,
          heardAtMs: options.receivedAtMs,
        };
      }
      state.buffer.push(options);
      state.lastCatsReceivedAtMs = options.receivedAtMs;
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
      const self = state.selfConnectionId;
      const playerHostId = chooseHost(state.players);
      if (state.hasSyncedPresence) state.enteredAtMs ??= nowMs;
      const hasFreshCats = nowMs - state.lastCatsReceivedAtMs <= SILENT_HOST_MS;
      const canStart =
        state.world !== undefined ||
        hasFreshCats ||
        (state.enteredAtMs !== undefined &&
          nowMs - state.enteredAtMs >= LISTEN_MS);
      const guestHostId =
        state.guestHost !== undefined &&
        nowMs - state.guestHost.heardAtMs <= SILENT_HOST_MS
          ? state.guestHost.connectionId
          : undefined;
      const isPlayerHostHeard =
        playerHostId !== undefined && state.heardPlayerHostId === playerHostId;
      const isHost =
        self !== undefined &&
        canStart &&
        (state.role === "player"
          ? playerHostId === self
          : !isPlayerHostHeard &&
            (guestHostId === undefined || self < guestHostId));
      const hostId = isHost
        ? self
        : isPlayerHostHeard
          ? playerHostId
          : (guestHostId ?? (playerHostId === self ? undefined : playerHostId));

      if (hostId !== state.followed.hostId)
        state.followed = { hostId, sinceMs: nowMs };
      const isHostSilent =
        hostId !== undefined &&
        !isHost &&
        nowMs - Math.max(state.lastCatsReceivedAtMs, state.followed.sinceMs) >
          SILENT_HOST_MS;
      const runsLocally = !isHost && (hostId === undefined || isHostSilent);
      const localPlayers = [...state.players, ...state.residents];

      if (isHost && state.world === undefined) {
        state.world =
          (hasFreshCats ? undefined : state.residentWorld) ??
          carryOnWorld({
            known: [...state.players, ...state.residents],
            fresh: state.residents,
          });
      }
      if (!isHost) {
        if (state.world !== undefined)
          state.hostedWorld = { world: state.world, stoppedAtMs: nowMs };
        state.world = undefined;
        state.unsentPrints = [];
      }
      if (isHost || runsLocally) {
        state.incomingPrints = [];
        legPlayer.reset();
      }
      if (!runsLocally) state.residentWorld = undefined;
      if (runsLocally && state.residentWorld === undefined) {
        const hostedWorld = state.hostedWorld;
        state.residentWorld =
          hostedWorld !== undefined &&
          state.lastCatsReceivedAtMs < hostedWorld.stoppedAtMs
            ? hostedWorld.world
            : carryOnWorld({ known: localPlayers, fresh: localPlayers });
        state.hostedWorld = undefined;
      }

      const events: RoomEvent[] = state.received
        .filter((received) => received.showAtMs <= nowMs)
        .map((received) => received.event);
      state.received = state.received.filter(
        (received) => received.showAtMs > nowMs
      );
      const steppedWorld = state.world ?? state.residentWorld;
      const placements = [
        ...state.placements,
        ...events.flatMap((event) =>
          event.kind === "placeToy" && steppedWorld !== undefined
            ? [{ itemId: event.itemId, x: event.x, y: event.y }]
            : []
        ),
      ];
      const sentPlacements: RoomEvent[] =
        steppedWorld === undefined
          ? state.placements.map((placement) => ({
              kind: "placeToy",
              userId: state.selfId ?? LOCAL_VISITOR_ID,
              ...placement,
            }))
          : [];
      if (steppedWorld !== undefined)
        for (const placement of placements)
          placeToy({ world: steppedWorld, ...placement });
      state.placements = [];
      const stepped: {
        snapshots: CatSnapshot[];
        toys: ToySnapshot[];
        cats: CatsMessage | undefined;
        events: RoomEvent[];
      } = (() => {
        if (state.world === undefined && state.residentWorld !== undefined) {
          const result = stepWorld({
            world: state.residentWorld,
            players: localPlayers,
            fingers: simFingers(nowMs),
            dtSeconds,
          });
          events.push(...result.events);
          return {
            snapshots: getCatSnapshots(state.residentWorld),
            toys: getToySnapshots(state.residentWorld),
            cats: undefined,
            events: [],
          };
        }
        if (state.world === undefined) {
          const legged = legPlayer.step({
            snapshots: state.buffer.sample({ nowMs }),
            lookOf,
            dtSeconds,
          });
          const due = state.incomingPrints.filter(
            (incoming) => incoming.showAtMs <= nowMs
          );
          state.incomingPrints = state.incomingPrints.filter(
            (incoming) => incoming.showAtMs > nowMs
          );
          events.push(
            ...due
              .map((incoming) => incoming.print)
              .filter((print) => legged.hostLegIds.has(print.userId)),
            ...legged.prints
          );
          return {
            snapshots: legged.snapshots,
            toys: state.buffer.sampleToys({ nowMs }),
            cats: undefined,
            events: [],
          };
        }
        const result = stepWorld({
          world: state.world,
          players: [...state.players, ...state.residents],
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
        const toys = getToySnapshots(state.world);
        const isDue =
          nowMs - state.lastCatsSentAtMs >=
          1000 / ROOM_LIMITS.catSnapshotsPerSecond;
        const toyIds = toys.map((toy) => toy.id).join(",");
        const isTrailsDue =
          nowMs - state.lastTrailsSentAtMs >= TRAILS_SEND_MS ||
          toyIds !== state.sentToyIds;
        const message =
          isDue && state.selfConnectionId !== undefined
            ? {
                hostId: state.selfConnectionId,
                sentAt: Date.now(),
                cats: current,
                prints: state.unsentPrints,
                toys,
              }
            : undefined;
        const cats =
          message !== undefined && isTrailsDue
            ? { ...message, trails: getToyTrails(state.world) }
            : message;
        if (cats !== undefined) {
          state.lastCatsSentAtMs = nowMs;
          state.unsentPrints = [];
          if (isTrailsDue) {
            state.lastTrailsSentAtMs = nowMs;
            state.sentToyIds = toyIds;
          }
        }
        return {
          snapshots: current,
          toys,
          cats,
          events: result.events.filter((event) => event.kind !== "pawPrint"),
        };
      })();
      const snapshots = stepped.snapshots;
      state.pending = state.pending.filter(
        (pending) =>
          pending.untilMs > nowMs &&
          !stepped.toys.some((toy) => toy.id === pending.itemId)
      );

      state.ownTip = stepFingertip({
        fingertip: state.ownTip,
        input: state.ownPointer,
        dtSeconds,
      });
      recordOwnTrail(nowMs);
      const fingerprint = ownFingerprint();
      if (fingerprint !== undefined) events.push(fingerprint);
      const outgoingEvents = [
        ...stepped.events,
        ...(fingerprint === undefined ? [] : [fingerprint]),
        ...sentPlacements,
      ];
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
        const newestAt = finger.samples.at(-1)?.t;
        const heldAt = finger.heldAt;
        const resumedAt =
          heldAt === undefined
            ? undefined
            : finger.samples.find((sample) => sample.t > heldAt)?.t;
        if (
          heldAt !== undefined &&
          resumedAt !== undefined &&
          resumedAt - heldAt <= STROKE_GAP_MS
        ) {
          const scheduledAt = nowMs - finger.clockOffset - PLAYBACK_DELAY_MS;
          const held = sampleFingerPath({
            samples: finger.samples,
            t: heldAt,
            maxGapMs: STROKE_GAP_MS,
          });
          const scheduled = sampleFingerPath({
            samples: finger.samples,
            t: scheduledAt,
            maxGapMs: STROKE_GAP_MS,
          });
          const jump =
            held === undefined || scheduled === undefined
              ? 0
              : Math.hypot(scheduled.x - held.x, scheduled.y - held.y);
          if (jump > CATCH_UP_JUMP && scheduledAt - heldAt <= MAX_CATCH_UP_MS)
            finger.clockOffset = nowMs - PLAYBACK_DELAY_MS - heldAt;
        }
        const playAt = nowMs - finger.clockOffset - PLAYBACK_DELAY_MS;
        finger.heldAt =
          newestAt !== undefined && playAt > newestAt ? newestAt : undefined;
        const point = sampleFingerPath({
          samples: finger.samples,
          t: playAt,
          maxGapMs: STROKE_GAP_MS,
        });
        const playedAt = finger.playedAt;
        finger.jumped =
          playedAt !== undefined &&
          finger.samples.some(
            (sample, index) =>
              sample.t > playedAt &&
              sample.t <= playAt &&
              sample.t - (finger.samples[index - 1]?.t ?? sample.t) >
                STROKE_GAP_MS
          );
        finger.playedAt = playAt;
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

      const cats = snapshots.flatMap((snapshot) => {
        const look = lookOf(snapshot.userId);
        return look === undefined
          ? []
          : [deriveCat({ snapshot, look, time: state.time })];
      });
      const marks = toyMarks.step({
        toys: stepped.toys,
        cats,
        time: state.time,
      });
      const spills = stepped.toys.flatMap((toy) =>
        toy.kind === "bowl" && toy.spill !== undefined ? [toy.spill] : []
      );
      const isWetStep = (event: RoomEvent) =>
        event.kind === "pawPrint" &&
        (spills.some((spill) => isInPuddle({ spill, ...event })) ||
          marks.wetPrints.some(
            (print) =>
              state.time - print.bornAt < WET_STEP_SECONDS &&
              Math.hypot(print.x - event.x, print.y - event.y) < WET_STEP_GAP
          ));
      for (const event of events) if (!isWetStep(event)) addPrint(event);
      state.prints = pruneScenePrints({
        prints: state.prints,
        time: state.time,
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
        toys: stepped.toys,
        trails:
          steppedWorld === undefined
            ? state.buffer.sampleTrails({ nowMs })
            : getToyTrails(steppedWorld),
        pendingItemIds: state.pending.map((pending) => pending.itemId),
        toyMarks: marks,
        sounds: events.filter(
          (event): event is Extract<RoomEvent, { kind: "sound" }> =>
            event.kind === "sound"
        ),
        residents: state.residents,
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
