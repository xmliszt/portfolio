import type { RoomSoundGroup } from "./room-sound-groups";
import { ROOM_SOUND_GROUPS } from "./room-sound-groups";
import type { LoopName, SoundName } from "./sound-names";

type RoomMixBoard = {
  play(
    name: SoundName,
    options: { volume?: number; group: RoomSoundGroup }
  ): void;
  holdLoop(
    name: LoopName,
    options: { group: RoomSoundGroup }
  ): { stop(): void };
};

type Schedule = (callback: () => void, delayMs: number) => () => void;

type GroupSound = {
  loops: LoopName[];
  moment?: {
    sounds: { name: SoundName; volume?: number; afterMs?: number }[];
    mixEveryMs: { min: number; max: number };
    soloEveryMs?: number;
  };
};

const GROUP_SOUNDS = {
  machines: { loops: ["washer-running", "dryer-running"] },
  "shop-bell": {
    loops: [],
    moment: {
      sounds: [{ name: "shop-bell" }],
      mixEveryMs: { min: 7_000, max: 13_000 },
      soloEveryMs: 2_600,
    },
  },
  unloading: {
    loops: [],
    moment: {
      sounds: [
        { name: "door-latch-open" },
        { name: "collect-laundry", volume: 0.5, afterMs: 350 },
      ],
      mixEveryMs: { min: 9_000, max: 16_000 },
      soloEveryMs: 2_200,
    },
  },
  coffee: {
    loops: ["coffee-brewing"],
    moment: {
      sounds: [{ name: "coffee-brew-done" }],
      mixEveryMs: { min: 16_000, max: 26_000 },
    },
  },
  tv: { loops: ["tv-no-signal"] },
  lamp: {
    loops: [],
    moment: {
      sounds: [{ name: "lamp-flicker" }],
      mixEveryMs: { min: 11_000, max: 18_000 },
      soloEveryMs: 2_400,
    },
  },
  weather: {
    loops: ["rain-outside"],
    moment: {
      sounds: [{ name: "thunder-rumble" }],
      mixEveryMs: { min: 8_000, max: 15_000 },
      soloEveryMs: 5_000,
    },
  },
} satisfies { [group in RoomSoundGroup]: GroupSound };

const SOLO_LINGER_MS = 900;
const FIRST_MOMENT_MS = { min: 600, max: 3_600 };

function getGroupSound(group: RoomSoundGroup): GroupSound {
  return GROUP_SOUNDS[group];
}

function setTimeoutSchedule(callback: () => void, delayMs: number) {
  const timer = setTimeout(callback, delayMs);
  return () => clearTimeout(timer);
}

/** Return a player that plays every room sound group together through `board` in each group's own channel, its loops held and its short sounds now and then, and can play one group alone while the visitor adjusts it. */
export function createRoomMix(options: {
  board: RoomMixBoard;
  schedule?: Schedule;
  random?: () => number;
}) {
  const schedule = options.schedule ?? setTimeoutSchedule;
  const random = options.random ?? Math.random;
  const state: {
    isMixing: boolean;
    solos: { [group in RoomSoundGroup]?: true };
    loops: { [group in RoomSoundGroup]?: { stop(): void }[] };
    cancelMoments: { [group in RoomSoundGroup]?: () => void };
    cancelLingers: { [group in RoomSoundGroup]?: () => void };
  } = {
    isMixing: false,
    solos: {},
    loops: {},
    cancelMoments: {},
    cancelLingers: {},
  };

  function isHeard(group: RoomSoundGroup) {
    return state.isMixing || state.solos[group] === true;
  }

  function playMoment(group: RoomSoundGroup) {
    getGroupSound(group).moment?.sounds.forEach((entry) => {
      const play = () =>
        options.board.play(entry.name, { volume: entry.volume, group });
      if (entry.afterMs === undefined) play();
      else schedule(play, entry.afterMs);
    });
  }

  function scheduleMoment(group: RoomSoundGroup, delayMs?: number) {
    state.cancelMoments[group]?.();
    delete state.cancelMoments[group];
    const moment = getGroupSound(group).moment;
    if (moment === undefined || !isHeard(group)) return;
    const everyMs = state.isMixing
      ? moment.mixEveryMs.min +
        random() * (moment.mixEveryMs.max - moment.mixEveryMs.min)
      : moment.soloEveryMs;
    if (everyMs === undefined) return;
    state.cancelMoments[group] = schedule(() => {
      playMoment(group);
      scheduleMoment(group);
    }, delayMs ?? everyMs);
  }

  function startGroup(group: RoomSoundGroup) {
    state.loops[group] ??= getGroupSound(group).loops.map((name) =>
      options.board.holdLoop(name, { group })
    );
  }

  function stopGroup(group: RoomSoundGroup) {
    state.cancelMoments[group]?.();
    delete state.cancelMoments[group];
    state.loops[group]?.forEach((loop) => loop.stop());
    delete state.loops[group];
  }

  return {
    get isMixing() {
      return state.isMixing;
    },
    isHeard,
    startMix() {
      if (state.isMixing) return;
      state.isMixing = true;
      ROOM_SOUND_GROUPS.forEach((group) => {
        startGroup(group);
        scheduleMoment(
          group,
          FIRST_MOMENT_MS.min +
            random() * (FIRST_MOMENT_MS.max - FIRST_MOMENT_MS.min)
        );
      });
    },
    stopMix() {
      if (!state.isMixing) return;
      state.isMixing = false;
      ROOM_SOUND_GROUPS.forEach((group) => {
        if (state.solos[group]) scheduleMoment(group);
        else stopGroup(group);
      });
    },
    startSolo(group: RoomSoundGroup) {
      state.cancelLingers[group]?.();
      delete state.cancelLingers[group];
      if (state.solos[group]) return;
      state.solos[group] = true;
      if (state.isMixing) return;
      startGroup(group);
      playMoment(group);
      scheduleMoment(group);
    },
    endSolo(group: RoomSoundGroup) {
      if (!state.solos[group]) return;
      state.cancelLingers[group]?.();
      state.cancelLingers[group] = schedule(() => {
        delete state.solos[group];
        delete state.cancelLingers[group];
        if (!state.isMixing) stopGroup(group);
      }, SOLO_LINGER_MS);
    },
    dispose() {
      state.isMixing = false;
      ROOM_SOUND_GROUPS.forEach((group) => {
        state.cancelLingers[group]?.();
        stopGroup(group);
      });
      state.solos = {};
      state.cancelLingers = {};
    },
  };
}
