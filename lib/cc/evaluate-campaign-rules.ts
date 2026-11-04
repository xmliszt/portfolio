import type { CampaignPlan } from "./campaign-plan";
import type { CampaignRule } from "./campaign-rules";
import { formatSgt } from "./format-sgt";
import { getPlatformMedian } from "./get-platform-median";
import type { SlotScores } from "./get-slot-scores";
import { getViewsAt24h } from "./get-views-at-24h";
import type { PlatformId } from "./platforms";
import { REPOST_STRATEGY } from "./repost-strategy";
import type { StatMetric } from "./stats-types";
import { suggestNextSlot } from "./suggest-next-slot";

const DAY_MS = 24 * 60 * 60_000;

/** A campaign post as the rules read it, with `at` its `scheduled_at` or else `posted_at`. */
export type RulePost = {
  id: string;
  platform: PlatformId;
  kind: string;
  status: string;
  parentPostId: string | undefined;
  at: Date | undefined;
  postedAt: Date | undefined;
};

type RuleMatch = {
  ruleId: string;
  postId: string;
  platformId: PlatformId;
  views: number;
  median: number;
  ratio: number;
};

export type RuleAction =
  | (RuleMatch & {
      kind: "schedule-repost";
      mode: "quote" | "recut";
      at: Date;
      reason: string;
    })
  | (RuleMatch & { kind: "suggest-repost" })
  | (RuleMatch & { kind: "suggest-recut" });

type Taken = { at: Date; platformId: PlatformId; isRepost: boolean };

function toDay(date: Date) {
  return formatSgt({ date, pattern: "yyyy-MM-dd" });
}

function isHoldingSlot(post: RulePost) {
  if (post.kind === "repost") return post.status !== "skipped";
  return (
    post.kind === "post" &&
    (post.status === "scheduled" || post.status === "posted")
  );
}

/** Return what `rules` ask for each posted `kind = 'post'` post, using the first rule its +24 h views match. A post with no repost yet gets a repost slot at the next good time after both `now` plus `minDaysLater` days and its `postedAt` plus the platform's `REPOST_STRATEGY` gap, away from days that already hold a repost on that platform and from the `occupied` times, or a repost suggestion when the strategy is "never"; other rules give a re-cut suggestion to a post with no repost. Posts in `suggestedPostIds` get no suggestion, and the strongest posts get slots first. */
export function evaluateCampaignRules(options: {
  rules: readonly CampaignRule[];
  posts: readonly RulePost[];
  metrics: readonly StatMetric[];
  suggestedPostIds: readonly string[];
  now: Date;
  plan: CampaignPlan;
  heat: { [id in PlatformId]: SlotScores };
  occupied: readonly { at: Date; platformId: PlatformId }[];
}): RuleAction[] {
  const repostedIds = new Set(
    options.posts.flatMap((post) =>
      post.kind === "repost" && post.parentPostId !== undefined
        ? [post.parentPostId]
        : []
    )
  );
  const matches = options.posts
    .filter((post) => post.kind === "post" && post.status === "posted")
    .flatMap((post) => {
      const views = getViewsAt24h({
        metrics: options.metrics,
        postId: post.id,
      });
      const median = getPlatformMedian({
        posts: options.posts,
        metrics: options.metrics,
        platformId: post.platform,
      });
      if (views === undefined || !median) return [];
      const measuredCount = options.posts.filter(
        (other) =>
          other.platform === post.platform &&
          other.kind !== "repost" &&
          getViewsAt24h({ metrics: options.metrics, postId: other.id }) !==
            undefined
      ).length;
      const ratio = views / median;
      const rule = options.rules.find(
        (candidate) =>
          measuredCount >= candidate.when.minMeasuredOnPlatform &&
          ratio >= (candidate.when.ratioToMedian.gte ?? -Infinity) &&
          ratio <= (candidate.when.ratioToMedian.lte ?? Infinity)
      );
      return rule === undefined
        ? []
        : [
            {
              post,
              then: rule.then,
              match: {
                ruleId: rule.id,
                postId: post.id,
                platformId: post.platform,
                views,
                median,
                ratio,
              },
            },
          ];
    })
    .toSorted((a, b) => b.match.ratio - a.match.ratio);

  const isSuggested = (postId: string) =>
    options.suggestedPostIds.includes(postId);

  const planned = matches.reduce<{ taken: Taken[]; actions: RuleAction[] }>(
    (state, entry) => {
      const then = entry.then;
      const platformId = entry.match.platformId;
      switch (then.kind) {
        case "suggest-recut":
          return isSuggested(entry.match.postId) ||
            repostedIds.has(entry.match.postId)
            ? state
            : {
                ...state,
                actions: [
                  ...state.actions,
                  { ...entry.match, kind: "suggest-recut" },
                ],
              };
        case "schedule-repost": {
          if (repostedIds.has(entry.match.postId)) return state;
          const strategy = REPOST_STRATEGY[platformId];
          if (strategy.mode === "never") {
            return isSuggested(entry.match.postId)
              ? state
              : {
                  ...state,
                  actions: [
                    ...state.actions,
                    { ...entry.match, kind: "suggest-repost" },
                  ],
                };
          }
          const slot = suggestNextSlot({
            platformId,
            notBefore: new Date(
              Math.max(
                options.now.getTime() + then.minDaysLater * DAY_MS,
                (entry.post.postedAt?.getTime() ?? 0) +
                  strategy.minGapDays * DAY_MS
              )
            ),
            occupied: state.taken.map((taken) => taken.at),
            minGapMinutes: options.plan.minGapMinutes,
            maxPerDay: options.plan.maxPerDay,
            availability: options.plan.availability,
            heat: options.heat[platformId],
            excludedDays: state.taken
              .filter(
                (taken) => taken.platformId === platformId && taken.isRepost
              )
              .map((taken) => toDay(taken.at)),
          });
          if (slot === undefined) return state;
          return {
            taken: [
              ...state.taken,
              { at: slot.at, platformId, isRepost: true },
            ],
            actions: [
              ...state.actions,
              {
                ...entry.match,
                kind: "schedule-repost",
                mode: strategy.mode,
                at: slot.at,
                reason: slot.reason,
              },
            ],
          };
        }
        default: {
          const unhandled: never = then;
          return unhandled;
        }
      }
    },
    {
      taken: [
        ...options.posts.flatMap((post) =>
          isHoldingSlot(post) && post.at !== undefined
            ? [
                {
                  at: post.at,
                  platformId: post.platform,
                  isRepost: post.kind === "repost",
                },
              ]
            : []
        ),
        ...options.occupied.map((entry) => ({
          at: entry.at,
          platformId: entry.platformId,
          isRepost: false,
        })),
      ],
      actions: [],
    }
  );
  return planned.actions;
}
