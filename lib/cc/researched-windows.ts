import type { PlatformId } from "./platforms";

/** A researched posting window in its platform's `timeZone`. */
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
  /** The IANA time zone that `hours` and `dayWeights` are in. */
  timeZone: string;
  /** The label for clock times in `timeZone`, or `undefined` when each window's `label` names the time. */
  clockLabel: string | undefined;
};

const US_EASTERN = { timeZone: "America/New_York", clockLabel: "ET" };
const SINGAPORE = { timeZone: "Asia/Singapore", clockLabel: undefined };
const FLAT: DayWeights = [1, 1, 1, 1, 1, 1, 1];

/** Day weights and hour windows per platform from `research-sources.ts`, weekday 0 for Monday, both in the platform's `timeZone`. */
export const RESEARCHED_WINDOWS: { [id in PlatformId]: PlatformResearch } = {
  producthunt: {
    dayWeights: [0.6, 1, 1, 1, 0.6, 0.4, 0.4],
    hours: [
      { startHour: 0, endHour: 1, strength: 1, label: "launch 00:01 PT" },
    ],
    timeZone: "America/Los_Angeles",
    clockLabel: undefined,
  },
  x: {
    dayWeights: [0.6, 1, 1, 0.85, 0.6, 0.3, 0.3],
    hours: [
      { startHour: 9, endHour: 11, strength: 1, label: "9–11 am ET" },
      { startHour: 11, endHour: 15, strength: 0.6, label: "11 am–3 pm ET" },
    ],
    ...US_EASTERN,
  },
  threads: {
    dayWeights: [0.6, 0.9, 1, 1, 0.6, 0.3, 0.3],
    hours: [
      { startHour: 9, endHour: 11, strength: 1, label: "9–11 am ET" },
      { startHour: 11, endHour: 12, strength: 0.6, label: "11 am ET" },
    ],
    ...US_EASTERN,
  },
  instagram: {
    dayWeights: [0.7, 0.8, 1, 0.9, 0.5, 0.3, 0.3],
    hours: [
      { startHour: 9, endHour: 10, strength: 1, label: "9 am ET" },
      { startHour: 10, endHour: 13, strength: 0.8, label: "10 am–1 pm ET" },
      { startHour: 17, endHour: 19, strength: 0.6, label: "5–7 pm ET" },
    ],
    ...US_EASTERN,
  },
  tiktok: {
    dayWeights: [0.7, 0.8, 0.7, 0.8, 0.7, 1, 0.7],
    hours: [
      { startHour: 9, endHour: 10, strength: 1, label: "9 am ET" },
      { startHour: 8, endHour: 12, strength: 0.7, label: "8 am–noon ET" },
    ],
    ...US_EASTERN,
  },
  reddit: {
    dayWeights: [0.85, 1, 1, 0.85, 0.85, 0.4, 0.4],
    hours: [{ startHour: 6, endHour: 11, strength: 1, label: "6–11 am ET" }],
    ...US_EASTERN,
  },
  xiaohongshu: {
    dayWeights: [0.7, 0.7, 0.7, 0.7, 0.7, 1, 1],
    hours: [
      { startHour: 21, endHour: 23, strength: 1, label: "情感 and 娱乐 peak" },
      { startHour: 20, endHour: 24, strength: 0.6, label: "evening" },
      { startHour: 7, endHour: 9, strength: 0.6, label: "morning commute" },
    ],
    ...SINGAPORE,
  },
  wechat_channels: {
    dayWeights: FLAT,
    hours: [{ startHour: 20, endHour: 22, strength: 1, label: "evening" }],
    ...SINGAPORE,
  },
  wechat_moments: {
    dayWeights: FLAT,
    hours: [{ startHour: 20, endHour: 22, strength: 1, label: "evening" }],
    ...SINGAPORE,
  },
  youtube: {
    dayWeights: FLAT,
    hours: [],
    ...SINGAPORE,
  },
  linkedin: {
    dayWeights: [0.6, 1, 0.85, 1, 0.5, 0.15, 0.15],
    hours: [{ startHour: 8, endHour: 10, strength: 1, label: "8–10 am ET" }],
    ...US_EASTERN,
  },
};
