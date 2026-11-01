import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type {
  CatsMessage,
  CatSnapshot,
  ToySnapshot,
  ToyTrail,
} from "@/lib/paws/wire-types";

import { clamp } from "./clamp";
import { interpolateCatSnapshot } from "./interpolate-cat-snapshot";
import { interpolateToySnapshot } from "./interpolate-toy-snapshot";

const KEEP_MESSAGES = 12;

type Received = {
  message: CatsMessage;
  hostTimeMs: number;
  /** The newest trails known when this message arrived, of the toys still in it. */
  trails: ToyTrail[];
};

export type SnapshotBuffer = {
  /** Keep `message`, received at local time `receivedAtMs`; a message from a new host replaces everything kept. */
  push: (options: { message: CatsMessage; receivedAtMs: number }) => void;
  /** Return every cat as it was `renderDelayMs` before local time `nowMs`, interpolated between the two messages around then and held at the newest one past it. */
  sample: (options: { nowMs: number }) => CatSnapshot[];
  /** Return every toy as it was at the same moment `sample` plays the cats. */
  sampleToys: (options: { nowMs: number }) => ToySnapshot[];
  /** Return the cats in the newest message, for a new host to carry on from. */
  latest: () => CatSnapshot[];
  /** Return the toys in the newest message, for a new host to carry on from. */
  latestToys: () => ToySnapshot[];
  /** Return the toy trails as they were at the same moment `sample` plays the cats. */
  sampleTrails: (options: { nowMs: number }) => ToyTrail[];
  /** Return the newest toy trails of the toys in the newest message, kept across a change of host. */
  latestTrails: () => ToyTrail[];
};

/** Return a buffer of received cat messages that plays them back smoothly, `renderDelayMs` behind the host. */
export function createSnapshotBuffer(
  options: { renderDelayMs?: number } = {}
): SnapshotBuffer {
  const renderDelayMs = options.renderDelayMs ?? ROOM_LIMITS.renderDelayMs;
  const state: {
    hostId: string | undefined;
    offsetMs: number;
    received: Received[];
    trails: ToyTrail[];
  } = {
    hostId: undefined,
    offsetMs: 0,
    received: [],
    trails: [],
  };
  function findAround(nowMs: number) {
    const targetMs = nowMs - state.offsetMs - renderDelayMs;
    const laterIndex = state.received.findIndex(
      (entry) => entry.hostTimeMs >= targetMs
    );
    const later =
      laterIndex === -1 ? state.received.at(-1) : state.received[laterIndex];
    const earlier = laterIndex > 0 ? state.received[laterIndex - 1] : undefined;
    if (later === undefined) return undefined;
    const t =
      earlier === undefined
        ? 1
        : clamp(
            (targetMs - earlier.hostTimeMs) /
              Math.max(1, later.hostTimeMs - earlier.hostTimeMs),
            0,
            1
          );
    return { earlier, later, t };
  }
  return {
    push: ({ message, receivedAtMs }) => {
      const offsetMs = receivedAtMs - message.sentAt;
      if (message.hostId !== state.hostId) {
        state.hostId = message.hostId;
        state.offsetMs = offsetMs;
        state.received = [];
      }
      state.offsetMs = Math.min(state.offsetMs, offsetMs);
      const last = state.received.at(-1);
      if (last !== undefined && message.sentAt <= last.message.sentAt) return;
      state.trails = (message.trails ?? state.trails).filter((trail) =>
        message.toys.some((toy) => toy.id === trail.toyId)
      );
      state.received = [
        ...state.received,
        { message, hostTimeMs: message.sentAt, trails: state.trails },
      ].slice(-KEEP_MESSAGES);
    },
    sample: ({ nowMs }) => {
      const around = findAround(nowMs);
      if (around === undefined) return [];
      const { earlier, later, t } = around;
      if (earlier === undefined) return later.message.cats;
      return later.message.cats.map((to) => {
        const from = earlier.message.cats.find(
          (candidate) => candidate.userId === to.userId
        );
        return from === undefined
          ? to
          : interpolateCatSnapshot({ from, to, t });
      });
    },
    sampleToys: ({ nowMs }) => {
      const around = findAround(nowMs);
      if (around === undefined) return [];
      const { earlier, later, t } = around;
      if (earlier === undefined) return later.message.toys;
      return later.message.toys.map((to) => {
        const from = earlier.message.toys.find(
          (candidate) => candidate.id === to.id
        );
        return from === undefined
          ? to
          : interpolateToySnapshot({ from, to, t });
      });
    },
    sampleTrails: ({ nowMs }) => {
      const around = findAround(nowMs);
      if (around === undefined) return state.trails;
      return (around.earlier ?? around.later).trails;
    },
    latest: () => state.received.at(-1)?.message.cats ?? [],
    latestToys: () => state.received.at(-1)?.message.toys ?? [],
    latestTrails: () => state.trails,
  };
}
