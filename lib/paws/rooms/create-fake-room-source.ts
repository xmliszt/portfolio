import {
  BELLIES,
  type CatLook,
  COAT_INKS,
  PAD_INKS,
  PATTERNS,
  STEPS,
} from "@/lib/paws/cat-look";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { RoomSource } from "@/lib/paws/room-source";
import { AGES, MOODS, VOICES } from "@/lib/paws/voice-settings";
import type { FingerMessage, PlayerPresence } from "@/lib/paws/wire-types";

const LATER_THAN_SELF_MS = 1000;
const MAX_STEP = 60;
const PRESS_CHANCE = 0.08;

type FakeFinger = { finger: FingerMessage; target: { x: number; y: number } };

function stepToward(options: {
  from: { x: number; y: number };
  to: { x: number; y: number };
}) {
  const dx = options.to.x - options.from.x;
  const dy = options.to.y - options.from.y;
  const distance = Math.hypot(dx, dy);
  const share = distance <= MAX_STEP ? 1 : MAX_STEP / distance;
  return { x: options.from.x + dx * share, y: options.from.y + dy * share };
}

/** Return a room source without a server for local development: joining adds `remotePlayerCount` made-up players who joined after `self`, so `self` hosts, and moves their fingertips toward random points `ROOM_LIMITS.fingerSendsPerSecond` times a second, pressing now and then; sends go nowhere. */
export function createFakeRoomSource(options: {
  remotePlayerCount: number;
  meowUrl: string;
  random: () => number;
}): RoomSource {
  const pick = <T>(items: readonly T[]) =>
    items[Math.floor(options.random() * items.length)] ?? items[0];
  const pickKey = <T extends object>(inks: T) =>
    pick(
      Object.keys(inks).filter(
        (key): key is Extract<keyof T, string> => key in inks
      )
    );
  const randomPoint = () => ({
    x: options.random() * ROOM_LIMITS.worldWidth,
    y: options.random() * ROOM_LIMITS.worldHeight,
  });

  function buildLook(): CatLook {
    return {
      coat: pickKey(COAT_INKS),
      pattern: pick(PATTERNS),
      belly: pick(BELLIES),
      pads: pickKey(PAD_INKS),
      size: pick(STEPS),
      fluff: pick(STEPS),
      tail: pick(STEPS),
      ears: pick(STEPS),
    };
  }

  const state: { stops: (() => void)[] } = { stops: [] };
  return {
    join({ self, onPlayers, onFinger }) {
      const startedAt = Date.now();
      const fakes = Array.from(
        { length: options.remotePlayerCount },
        (_, index): PlayerPresence => ({
          userId: `fake-${index + 1}`,
          connectionId: `fake-${index + 1}`,
          look: buildLook(),
          voice: { age: pick(AGES), voice: pick(VOICES), mood: pick(MOODS) },
          meowUrl: options.meowUrl,
          joinedAt: (self?.joinedAt ?? startedAt) + LATER_THAN_SELF_MS + index,
        })
      );
      const fingers: { all: FakeFinger[] } = {
        all: fakes.map((fake) => ({
          finger: {
            userId: fake.userId,
            ...randomPoint(),
            pressed: false,
            seq: 0,
          },
          target: randomPoint(),
        })),
      };
      const timer = window.setInterval(() => {
        fingers.all = fingers.all.map(({ finger, target }) => {
          const isNear =
            Math.hypot(target.x - finger.x, target.y - finger.y) < 1;
          return {
            finger: {
              userId: finger.userId,
              ...stepToward({ from: finger, to: target }),
              pressed:
                options.random() < PRESS_CHANCE
                  ? !finger.pressed
                  : finger.pressed,
              seq: finger.seq + 1,
            },
            target: isNear ? randomPoint() : target,
          };
        });
        fingers.all.forEach(({ finger }) => onFinger(finger));
      }, 1000 / ROOM_LIMITS.fingerSendsPerSecond);
      const stop = () => window.clearInterval(timer);
      state.stops = [...state.stops, stop];
      onPlayers(self === undefined ? fakes : [self, ...fakes]);
      return {
        sendFinger: () => {},
        sendCats: () => {},
        sendEvent: () => {},
        leave() {
          stop();
          state.stops = state.stops.filter((candidate) => candidate !== stop);
        },
      };
    },
    dispose() {
      state.stops.forEach((stop) => stop());
      state.stops = [];
    },
  };
}
