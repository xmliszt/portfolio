import keyBy from "lodash/keyBy.js";

import type { SmartCampaignSlot } from "./build-smart-campaign-plan";
import type { SmartCampaignReplyPost } from "./parse-smart-campaign-response";

/** A post from ChatGPT's reply ready to preview: the plan's platform, wave, kind, parent, language and media for a planned `ref`, ChatGPT's own values otherwise. */
export type SmartCampaignDraft = SmartCampaignReplyPost & {
  /** `true` if the plan asked for this `ref`; `false` when ChatGPT added it. */
  isPlanned: boolean;
};

/** Return the reply's posts in plan order with the plan's fields applied, then the posts the plan did not ask for, with the required refs the reply left out and the refs it added. */
export function matchSmartCampaignReply(options: {
  slots: readonly SmartCampaignSlot[];
  posts: readonly SmartCampaignReplyPost[];
}) {
  const postsByRef = keyBy(options.posts, (post) => post.ref);
  const slotRefs = new Set(options.slots.map((slot) => slot.ref));
  const planned = options.slots.flatMap((slot): SmartCampaignDraft[] => {
    const post = postsByRef[slot.ref];
    return post === undefined
      ? []
      : [
          {
            ...post,
            platformId: slot.platformId,
            wave: slot.wave,
            kind: slot.kind,
            parentRef: slot.parentRef,
            language: slot.language,
            media: slot.media,
            isPlanned: true,
          },
        ];
  });
  const extra = options.posts
    .filter((post) => !slotRefs.has(post.ref))
    .map((post): SmartCampaignDraft => ({ ...post, isPlanned: false }));
  return {
    drafts: [...planned, ...extra],
    missingRefs: options.slots
      .filter((slot) => !slot.optional && postsByRef[slot.ref] === undefined)
      .map((slot) => slot.ref),
    extraRefs: extra.map((post) => post.ref),
  };
}
