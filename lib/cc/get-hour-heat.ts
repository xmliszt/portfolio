import groupBy from "lodash/groupBy.js";
import mean from "lodash/mean.js";
import range from "lodash/range.js";

import { formatSgt } from "./format-sgt";
import { getResearchedSlot } from "./get-researched-slot";
import { getSgtParts } from "./get-sgt-parts";
import { getSgtWeek } from "./get-sgt-week";
import { getViewsAt24h } from "./get-views-at-24h";
import type { PlatformId } from "./platforms";
import { sgtToUtc } from "./sgt-to-utc";
import type { StatMetric, StatPost } from "./stats-types";

const MIN_OWN_POSTS = 10;

type HourHeat =
  | { kind: "own"; cells: (number | undefined)[][] }
  | { kind: "researched"; cells: number[][] };

/** Return a weekday×hour grid in Singapore time for `platformId`: mean 24h views of its own posts once it has 10+, otherwise the researched day weight times hour window strength, from 0 to 1, for the hours of the week holding `weekOf`. */
export function getHourHeat(options: {
  posts: readonly StatPost[];
  metrics: readonly StatMetric[];
  platformId: PlatformId;
  weekOf: Date;
}): HourHeat {
  const measured = options.posts.flatMap((post) => {
    const views = getViewsAt24h({ metrics: options.metrics, postId: post.id });
    return post.platform === options.platformId &&
      post.postedAt !== undefined &&
      views !== undefined
      ? [{ ...getSgtParts(post.postedAt), views }]
      : [];
  });
  if (measured.length >= MIN_OWN_POSTS) {
    const bySlot = groupBy(measured, (post) => `${post.weekday}:${post.hour}`);
    return {
      kind: "own",
      cells: range(7).map((weekday) =>
        range(24).map((hour) => {
          const slot = bySlot[`${weekday}:${hour}`];
          return slot ? mean(slot.map((post) => post.views)) : undefined;
        })
      ),
    };
  }
  const days = getSgtWeek({
    date: formatSgt({ date: options.weekOf, pattern: "yyyy-MM-dd" }),
  }).days;
  return {
    kind: "researched",
    cells: days.map((date) =>
      range(24).map(
        (hour) =>
          getResearchedSlot({
            platformId: options.platformId,
            at: sgtToUtc({ date, time: `${hour}:00` }),
          }).score
      )
    ),
  };
}
