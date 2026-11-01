import groupBy from "lodash/groupBy.js";
import mean from "lodash/mean.js";
import uniq from "lodash/uniq.js";

import { getViewsAt24h } from "./get-views-at-24h";
import type { PlatformId } from "./platforms";
import type { StatMetric, StatPost } from "./stats-types";

const MIN_USES = 3;

type HashtagLift = {
  platform: PlatformId;
  tag: string;
  uses: number;
  meanWith: number;
  meanWithout: number | undefined;
  lift: number | undefined;
};

function normalizeTag(tag: string) {
  return tag.replace(/^#/, "").toLowerCase();
}

/** Return, per platform and tag used 3+ times, the mean 24h views of posts with the tag against those without, highest lift first. */
export function getHashtagLift(options: {
  posts: readonly StatPost[];
  metrics: readonly StatMetric[];
}) {
  const measured = options.posts.flatMap((post) => {
    const views = getViewsAt24h({ metrics: options.metrics, postId: post.id });
    return views === undefined
      ? []
      : [
          {
            platform: post.platform,
            tags: uniq(post.hashtags.map(normalizeTag)),
            views,
          },
        ];
  });
  const lifts = Object.values(
    groupBy(measured, (post) => post.platform)
  ).flatMap((platformPosts): HashtagLift[] =>
    uniq(platformPosts.flatMap((post) => post.tags)).flatMap((tag) => {
      const withTag = platformPosts.filter((post) => post.tags.includes(tag));
      if (withTag.length < MIN_USES) {
        return [];
      }
      const withoutTag = platformPosts.filter(
        (post) => !post.tags.includes(tag)
      );
      const meanWith = mean(withTag.map((post) => post.views));
      const meanWithout =
        withoutTag.length > 0
          ? mean(withoutTag.map((post) => post.views))
          : undefined;
      return [
        {
          platform: platformPosts[0].platform,
          tag,
          uses: withTag.length,
          meanWith,
          meanWithout,
          lift: meanWithout ? meanWith / meanWithout : undefined,
        },
      ];
    })
  );
  return lifts.toSorted(
    (a, b) => (b.lift ?? -Infinity) - (a.lift ?? -Infinity)
  );
}
