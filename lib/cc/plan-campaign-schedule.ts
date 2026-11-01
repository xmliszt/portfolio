import sortBy from "lodash/sortBy.js";

import type { CampaignPlan } from "./campaign-plan";
import { formatSgt } from "./format-sgt";
import type { SlotScores } from "./get-slot-scores";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "./platforms";
import { sgtToUtc } from "./sgt-to-utc";
import { suggestNextSlot } from "./suggest-next-slot";

/** A top-level post as the planner reads it, with its planner `wave` or `undefined` for last. */
export type PlannerPost = {
  id: string;
  platformId: PlatformId;
  status: string;
  scheduledAt: Date | undefined;
  scheduledBy: "user" | "planner";
  wave: number | undefined;
};

type PlanRowBase = {
  postId: string;
  platformId: PlatformId;
  wave: number | undefined;
  current: Date | undefined;
  reason: string;
};

export type PlanRow =
  | (PlanRowBase & { kind: "moved" | "unchanged"; proposed: Date })
  | (PlanRowBase & { kind: "pinned" | "unplaced" });

type Occupied = { at: Date; platformId: PlatformId };

type PlanState = {
  occupied: Occupied[];
  placed: { at: Date; waveRank: number }[];
  rows: PlanRow[];
};

function getPinReason(options: {
  post: PlannerPost;
  includeUserPlaced: boolean;
}) {
  if (PLATFORMS[options.post.platformId].plannerPinned) {
    return `${PLATFORMS[options.post.platformId].label} stays where you set it`;
  }
  return options.post.scheduledBy === "user" &&
    options.post.scheduledAt !== undefined &&
    !options.includeUserPlaced
    ? "Placed by hand"
    : undefined;
}

function toDay(date: Date) {
  return formatSgt({ date, pattern: "yyyy-MM-dd" });
}

/** Return a proposed time and reason for each unposted, unskipped post the planner may move, placing wave 1 before wave 2 and so on with unwaved posts last; posted posts, Product Hunt, YouTube and (unless `includeUserPlaced`) timed posts with `scheduledBy` "user" stay where they are and count as occupied like `reposts`, and hold later waves behind their own. */
export function planCampaignSchedule(options: {
  posts: readonly PlannerPost[];
  plan: CampaignPlan;
  heat: { [id in PlatformId]: SlotScores };
  now: Date;
  includeUserPlaced: boolean;
  reposts: readonly Occupied[];
}): PlanRow[] {
  const live = options.posts.filter((post) => post.status !== "skipped");
  const pinned = live.flatMap((post) => {
    const reason =
      post.status === "posted"
        ? "Posted"
        : getPinReason({ post, includeUserPlaced: options.includeUserPlaced });
    return reason === undefined ? [] : [{ post, reason }];
  });
  const pinnedIds = new Set(pinned.map((entry) => entry.post.id));
  const movable = sortBy(
    live.filter((post) => !pinnedIds.has(post.id)),
    (post) => post.wave ?? Number.POSITIVE_INFINITY,
    (post) => post.scheduledAt?.getTime() ?? Number.POSITIVE_INFINITY,
    (post) => PLATFORM_IDS.indexOf(post.platformId),
    (post) => post.id
  );
  const startAt =
    options.plan.startDate === undefined
      ? options.now
      : new Date(
          Math.max(
            options.now.getTime(),
            sgtToUtc({ date: options.plan.startDate, time: "00:00" }).getTime()
          )
        );

  const planned = movable.reduce<PlanState>(
    (state, post) => {
      const waveRank = post.wave ?? Number.POSITIVE_INFINITY;
      const notBefore = new Date(
        Math.max(
          startAt.getTime(),
          ...state.placed
            .filter((entry) => entry.waveRank < waveRank)
            .map((entry) => entry.at.getTime())
        )
      );
      const slot = suggestNextSlot({
        platformId: post.platformId,
        notBefore,
        occupied: state.occupied.map((entry) => entry.at),
        minGapMinutes: options.plan.minGapMinutes,
        maxPerDay: options.plan.maxPerDay,
        availability: options.plan.availability,
        heat: options.heat[post.platformId],
        excludedDays:
          post.platformId === "reddit"
            ? state.occupied
                .filter((entry) => entry.platformId === "reddit")
                .map((entry) => toDay(entry.at))
            : undefined,
      });
      const base = {
        postId: post.id,
        platformId: post.platformId,
        wave: post.wave,
        current: post.scheduledAt,
      };
      if (slot === undefined) {
        return {
          ...state,
          rows: [
            ...state.rows,
            {
              ...base,
              kind: "unplaced",
              reason: "No free slot in the next 14 days",
            },
          ],
        };
      }
      return {
        occupied: [
          ...state.occupied,
          { at: slot.at, platformId: post.platformId },
        ],
        placed: [...state.placed, { at: slot.at, waveRank }],
        rows: [
          ...state.rows,
          {
            ...base,
            kind:
              post.scheduledAt?.getTime() === slot.at.getTime()
                ? "unchanged"
                : "moved",
            proposed: slot.at,
            reason: slot.reason,
          },
        ],
      };
    },
    {
      occupied: [
        ...options.reposts,
        ...pinned.flatMap((entry) =>
          entry.post.scheduledAt === undefined
            ? []
            : [
                {
                  at: entry.post.scheduledAt,
                  platformId: entry.post.platformId,
                },
              ]
        ),
      ],
      placed: pinned.flatMap((entry) =>
        entry.post.scheduledAt === undefined || entry.post.wave === undefined
          ? []
          : [{ at: entry.post.scheduledAt, waveRank: entry.post.wave }]
      ),
      rows: [],
    }
  );

  const pinnedRows = pinned
    .filter((entry) => entry.post.status !== "posted")
    .map(
      (entry): PlanRow => ({
        kind: "pinned",
        postId: entry.post.id,
        platformId: entry.post.platformId,
        wave: entry.post.wave,
        current: entry.post.scheduledAt,
        reason: entry.reason,
      })
    );
  return sortBy(
    [...planned.rows, ...pinnedRows],
    (row) =>
      (row.kind === "moved" || row.kind === "unchanged"
        ? row.proposed
        : row.current
      )?.getTime() ?? Number.POSITIVE_INFINITY
  );
}
