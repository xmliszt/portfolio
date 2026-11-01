import type { PlatformId } from "./platforms";

/** A researched posting window in Singapore time; `endHour` past 24 runs into the next weekday. */
export type ResearchedWindow = {
  weekdays: readonly number[];
  startHour: number;
  endHour: number;
  strength: number;
};

const WEEKDAYS = [0, 1, 2, 3, 4];
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

/** Posting windows from research/posting-times.md and the 小红书 情感类 and 娱乐类 rows, weekday 0 for Monday. */
export const RESEARCHED_WINDOWS = {
  producthunt: [
    { weekdays: [1, 2, 3], startHour: 16, endHour: 17, strength: 1 },
    { weekdays: [0, 4], startHour: 16, endHour: 17, strength: 0.6 },
    { weekdays: [5, 6], startHour: 16, endHour: 17, strength: 0.4 },
  ],
  x: [{ weekdays: WEEKDAYS, startHour: 22, endHour: 24, strength: 1 }],
  threads: [
    { weekdays: [1], startHour: 22, endHour: 23, strength: 1 },
    { weekdays: WEEKDAYS, startHour: 22, endHour: 23, strength: 0.5 },
  ],
  instagram: [
    { weekdays: [0, 1, 2, 3], startHour: 22, endHour: 25, strength: 0.7 },
  ],
  tiktok: [
    { weekdays: [6], startHour: 22, endHour: 23, strength: 1 },
    { weekdays: [5], startHour: 22, endHour: 25, strength: 0.7 },
  ],
  reddit: [{ weekdays: WEEKDAYS, startHour: 19, endHour: 22, strength: 1 }],
  xiaohongshu: [
    { weekdays: EVERY_DAY, startHour: 20, endHour: 23, strength: 0.7 },
    { weekdays: EVERY_DAY, startHour: 21, endHour: 22, strength: 1 },
  ],
  wechat_channels: [
    { weekdays: EVERY_DAY, startHour: 21, endHour: 22, strength: 0.6 },
  ],
  wechat_moments: [
    { weekdays: EVERY_DAY, startHour: 7, endHour: 9, strength: 0.6 },
    { weekdays: EVERY_DAY, startHour: 12, endHour: 13, strength: 0.7 },
    { weekdays: EVERY_DAY, startHour: 20, endHour: 23, strength: 1 },
  ],
  youtube: [],
  linkedin: [
    { weekdays: [1, 2, 3], startHour: 21, endHour: 23, strength: 1 },
    { weekdays: [0, 4], startHour: 21, endHour: 23, strength: 0.6 },
  ],
} as const satisfies { [id in PlatformId]: readonly ResearchedWindow[] };
