import type { PlatformId } from "./platforms";

/** A researched posting window in Singapore time; `endHour` past 24 runs into the next weekday. */
export type ResearchedWindow = {
  startHour: number;
  endHour: number;
  strength: number;
  label: string;
};

/** Weights from 0 to 1 for Monday to Sunday. */
export type DayWeights = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export type PlatformResearch = {
  dayWeights: DayWeights;
  hours: readonly ResearchedWindow[];
  /** The audience's time zone, when the research gives times there: SGT hour plus `offsetHours` is the audience's hour. */
  audienceZone: { label: string; offsetHours: number } | undefined;
};

const US_EASTERN = { label: "ET", offsetHours: -13 };
const FLAT: DayWeights = [1, 1, 1, 1, 1, 1, 1];

/** Day weights and hour windows per platform from `research-sources.ts`, weekday 0 for Monday; a window spilling past midnight takes the weight of the day it starts on. */
export const RESEARCHED_WINDOWS: { [id in PlatformId]: PlatformResearch } = {
  producthunt: {
    dayWeights: [0.6, 1, 1, 1, 0.6, 0.4, 0.4],
    hours: [
      { startHour: 16, endHour: 17, strength: 1, label: "launch 00:01 PT" },
    ],
    audienceZone: undefined,
  },
  x: {
    dayWeights: [0.6, 1, 1, 0.85, 0.6, 0.3, 0.3],
    hours: [
      { startHour: 22, endHour: 24, strength: 1, label: "9–11 am ET" },
      { startHour: 24, endHour: 28, strength: 0.6, label: "11 am–3 pm ET" },
    ],
    audienceZone: US_EASTERN,
  },
  threads: {
    dayWeights: [0.6, 0.9, 1, 1, 0.6, 0.3, 0.3],
    hours: [
      { startHour: 22, endHour: 24, strength: 1, label: "9–11 am ET" },
      { startHour: 24, endHour: 25, strength: 0.6, label: "11 am ET" },
    ],
    audienceZone: US_EASTERN,
  },
  instagram: {
    dayWeights: [0.7, 0.8, 1, 0.9, 0.5, 0.3, 0.3],
    hours: [
      { startHour: 22, endHour: 23, strength: 1, label: "9 am ET" },
      { startHour: 23, endHour: 26, strength: 0.8, label: "10 am–1 pm ET" },
      { startHour: 30, endHour: 32, strength: 0.6, label: "5–7 pm ET" },
    ],
    audienceZone: US_EASTERN,
  },
  tiktok: {
    dayWeights: [0.7, 0.8, 0.7, 0.8, 0.7, 1, 0.7],
    hours: [
      { startHour: 22, endHour: 23, strength: 1, label: "9 am ET" },
      { startHour: 21, endHour: 25, strength: 0.7, label: "8 am–noon ET" },
    ],
    audienceZone: US_EASTERN,
  },
  reddit: {
    dayWeights: [0.85, 1, 1, 0.85, 0.85, 0.4, 0.4],
    hours: [{ startHour: 19, endHour: 24, strength: 1, label: "6–11 am ET" }],
    audienceZone: US_EASTERN,
  },
  xiaohongshu: {
    dayWeights: [0.7, 0.7, 0.7, 0.7, 0.7, 1, 1],
    hours: [
      { startHour: 21, endHour: 23, strength: 1, label: "情感 and 娱乐 peak" },
      { startHour: 20, endHour: 24, strength: 0.6, label: "evening" },
      { startHour: 7, endHour: 9, strength: 0.6, label: "morning commute" },
    ],
    audienceZone: undefined,
  },
  wechat_channels: {
    dayWeights: FLAT,
    hours: [{ startHour: 20, endHour: 22, strength: 1, label: "evening" }],
    audienceZone: undefined,
  },
  wechat_moments: {
    dayWeights: FLAT,
    hours: [{ startHour: 20, endHour: 22, strength: 1, label: "evening" }],
    audienceZone: undefined,
  },
  youtube: {
    dayWeights: FLAT,
    hours: [],
    audienceZone: undefined,
  },
  linkedin: {
    dayWeights: [0.6, 1, 0.85, 1, 0.5, 0.15, 0.15],
    hours: [{ startHour: 21, endHour: 23, strength: 1, label: "8–10 am ET" }],
    audienceZone: US_EASTERN,
  },
};
