/** One campaign rule: when a posted post's +24 h views compare with its platform's median as `when` says, CC does `then`. */
export type CampaignRule = {
  id: string;
  when: {
    checkpoint: "24h";
    ratioToMedian: { gte?: number; lte?: number };
    minMeasuredOnPlatform: number;
  };
  then:
    | { kind: "schedule-repost"; minDaysLater: number }
    | { kind: "suggest-recut" };
};

export const CAMPAIGN_RULES: readonly CampaignRule[] = [
  {
    id: "repost-strong",
    when: {
      checkpoint: "24h",
      ratioToMedian: { gte: 1.5 },
      minMeasuredOnPlatform: 1,
    },
    then: { kind: "schedule-repost", minDaysLater: 3 },
  },
  {
    id: "recut-weak",
    when: {
      checkpoint: "24h",
      ratioToMedian: { lte: 0.5 },
      minMeasuredOnPlatform: 3,
    },
    then: { kind: "suggest-recut" },
  },
];
