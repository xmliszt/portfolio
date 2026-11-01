import groupBy from "lodash/groupBy.js";
import mean from "lodash/mean.js";
import range from "lodash/range.js";

import { getSgtParts } from "./get-sgt-parts";
import { getViewsAt24h } from "./get-views-at-24h";
import type { PlatformId } from "./platforms";
import {
  RESEARCHED_WINDOWS,
  type ResearchedWindow,
} from "./researched-windows";
import type { StatMetric, StatPost } from "./stats-types";

const MIN_OWN_POSTS = 10;

type HourHeat =
  | { kind: "own"; cells: (number | undefined)[][] }
  | { kind: "researched"; cells: number[][] };

function getWindowStrength(options: {
  windows: readonly ResearchedWindow[];
  weekday: number;
  hour: number;
}) {
  return Math.max(
    0,
    ...options.windows
      .filter((window) =>
        window.weekdays.some((startDay) =>
          range(window.startHour, window.endHour).some(
            (windowHour) =>
              (startDay + Math.floor(windowHour / 24)) % 7 ===
                options.weekday && windowHour % 24 === options.hour
          )
        )
      )
      .map((window) => window.strength)
  );
}

/** Return a weekday×hour grid in Singapore time for `platformId`: mean 24h views of its own posts once it has 10+, otherwise researched window strengths from 0 to 1. */
export function getHourHeat(options: {
  posts: readonly StatPost[];
  metrics: readonly StatMetric[];
  platformId: PlatformId;
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
  const windows = RESEARCHED_WINDOWS[options.platformId];
  return {
    kind: "researched",
    cells: range(7).map((weekday) =>
      range(24).map((hour) => getWindowStrength({ windows, weekday, hour }))
    ),
  };
}
