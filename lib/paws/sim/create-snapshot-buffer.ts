import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { CatsMessage,CatSnapshot } from "@/lib/paws/wire-types";

import { clamp } from "./clamp";
import { interpolateCatSnapshot } from "./interpolate-cat-snapshot";

const KEEP_MESSAGES = 12;

type Received = { message: CatsMessage; hostTimeMs: number };

export type SnapshotBuffer = {
  /** Keep `message`, received at local time `receivedAtMs`; a message from a new host replaces everything kept. */
  push: (options: { message: CatsMessage; receivedAtMs: number }) => void;
  /** Return every cat as it was `renderDelayMs` before local time `nowMs`, interpolated between the two messages around then and held at the newest one past it. */
  sample: (options: { nowMs: number }) => CatSnapshot[];
  /** Return the cats in the newest message, for a new host to carry on from. */
  latest: () => CatSnapshot[];
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
  } = {
    hostId: undefined,
    offsetMs: 0,
    received: [],
  };
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
      state.received = [
        ...state.received,
        { message, hostTimeMs: message.sentAt },
      ].slice(-KEEP_MESSAGES);
    },
    sample: ({ nowMs }) => {
      const targetMs = nowMs - state.offsetMs - renderDelayMs;
      const laterIndex = state.received.findIndex(
        (entry) => entry.hostTimeMs >= targetMs
      );
      const later =
        laterIndex === -1 ? state.received.at(-1) : state.received[laterIndex];
      const earlier =
        laterIndex > 0 ? state.received[laterIndex - 1] : undefined;
      if (later === undefined) return [];
      if (earlier === undefined) return later.message.cats;
      const t = clamp(
        (targetMs - earlier.hostTimeMs) /
          Math.max(1, later.hostTimeMs - earlier.hostTimeMs),
        0,
        1
      );
      return later.message.cats.map((to) => {
        const from = earlier.message.cats.find(
          (candidate) => candidate.userId === to.userId
        );
        return from === undefined
          ? to
          : interpolateCatSnapshot({ from, to, t });
      });
    },
    latest: () => state.received.at(-1)?.message.cats ?? [],
  };
}
