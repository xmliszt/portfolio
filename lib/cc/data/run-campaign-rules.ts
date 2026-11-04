import "server-only";

import keyBy from "lodash/keyBy.js";

import { CAMPAIGN_RULES } from "@/lib/cc/campaign-rules";
import {
  evaluateCampaignRules,
  type RuleAction,
  type RulePost,
} from "@/lib/cc/evaluate-campaign-rules";
import { getPostName } from "@/lib/cc/get-post-name";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { buildRuleMessage } from "@/lib/cc/telegram/build-rule-message";
import { sendTelegramMessage } from "@/lib/cc/telegram/send-telegram-message";

import type { PostRow } from "./cc-rows";
import { getCurrentCampaign } from "./get-current-campaign";
import { listPostMetrics } from "./list-post-metrics";
import { loadPlannerInput } from "./load-planner-input";
import { syncPostReminders } from "./sync-post-reminders";
import { toStatRows } from "./to-stat-rows";

const REPOST_TITLE = {
  quote: "Quote your post",
  recut: "Re-cut: new first line or cover",
} as const;

function toRulePost(post: PostRow): RulePost[] {
  if (!isPlatformId(post.platform)) return [];
  const at = post.scheduled_at ?? post.posted_at;
  return [
    {
      id: post.id,
      platform: post.platform,
      kind: post.kind,
      status: post.status,
      parentPostId: post.parent_post_id ?? undefined,
      at: at === null ? undefined : new Date(at),
      postedAt: post.posted_at === null ? undefined : new Date(post.posted_at),
    },
  ];
}

async function sendRuleMessage(options: {
  action: RuleAction;
  original: PostRow;
  repostId: string | undefined;
}) {
  return sendTelegramMessage(
    buildRuleMessage({
      action: options.action,
      postName: getPostName(options.original),
      repostId: options.repostId,
    })
  ).catch((error: unknown) => {
    console.error("CC rule message failed", options.action.postId, error);
    return undefined;
  });
}

async function applyRuleAction(options: {
  action: RuleAction;
  original: PostRow;
  now: Date;
}) {
  const { action, original } = options;
  const supabase = createCcServiceClient();
  switch (action.kind) {
    case "schedule-repost": {
      const { data: repost, error } = await supabase
        .from("posts")
        .insert({
          campaign_id: original.campaign_id,
          platform: original.platform,
          kind: "repost",
          parent_post_id: original.id,
          target: original.target,
          title: REPOST_TITLE[action.mode],
          body: original.body,
          hashtags: original.hashtags,
          link:
            action.mode === "quote"
              ? (original.url ?? original.link)
              : original.link,
          assets: original.assets,
          status: action.mode === "quote" ? "scheduled" : "draft",
          repost_as: action.mode === "quote" ? "quote" : "post",
          scheduled_at: action.at.toISOString(),
          scheduled_by: "planner",
          wave: original.wave,
        })
        .select("*")
        .single();
      if (error) throw error;
      await syncPostReminders({
        postId: repost.id,
        status: repost.status,
        kind: repost.kind,
        repostAs: repost.repost_as,
        campaignId: repost.campaign_id,
        scheduledAt: repost.scheduled_at,
        postedAt: repost.posted_at,
      });
      const messageId = await sendRuleMessage({
        action,
        original,
        repostId: repost.id,
      });
      return {
        kind: "scheduled" as const,
        postId: original.id,
        repostId: repost.id,
        at: action.at.toISOString(),
        isAnnounced: messageId !== undefined,
      };
    }
    case "suggest-repost":
    case "suggest-recut": {
      const now = options.now.toISOString();
      const { data: marked, error } = await supabase
        .from("reminders")
        .upsert(
          {
            post_id: original.id,
            kind: "repost",
            checkpoint: "24h",
            fire_at: now,
            sent_at: now,
            done_at: now,
          },
          { onConflict: "post_id,kind,checkpoint", ignoreDuplicates: true }
        )
        .select("id");
      if (error) throw error;
      const reminderId = marked.at(0)?.id;
      if (reminderId === undefined) return undefined;
      const messageId = await sendRuleMessage({
        action,
        original,
        repostId: undefined,
      });
      const { error: recordError } =
        messageId === undefined
          ? await supabase.from("reminders").delete().eq("id", reminderId)
          : await supabase
              .from("reminders")
              .update({ telegram_message_id: messageId })
              .eq("id", reminderId);
      if (recordError) throw recordError;
      return messageId === undefined
        ? undefined
        : {
            kind: "suggested" as const,
            postId: original.id,
            rule: action.kind,
          };
    }
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}

/** Evaluate `CAMPAIGN_RULES` on the current campaign's own posts as of `now`: create each repost the rules schedule (status "scheduled" for a quote-post, a "draft" holding the slot for a re-cut), sync its reminders and announce it on Telegram with a Skip button, and send each suggestion once, recording it as a closed "repost" reminder on the original; one failed action does not stop the others; return what each action did. */
export async function runCampaignRules(options: { now: Date }) {
  const campaign = await getCurrentCampaign();
  if (campaign === undefined) return { actions: [] };
  const input = await loadPlannerInput({ campaignId: campaign.id });
  const metrics = await listPostMetrics({
    postIds: input.posts.map((post) => post.id),
  });
  const stats = toStatRows({ posts: input.posts, metrics });
  const { data: suggestedRows, error } = await createCcServiceClient()
    .from("reminders")
    .select("post_id")
    .eq("kind", "repost")
    .in(
      "post_id",
      input.posts.map((post) => post.id)
    );
  if (error) throw error;

  const actions = evaluateCampaignRules({
    rules: CAMPAIGN_RULES,
    posts: input.posts.flatMap(toRulePost),
    metrics: stats.metrics,
    suggestedPostIds: suggestedRows.map((row) => row.post_id),
    now: options.now,
    plan: input.plan,
    heat: input.heat,
    occupied: input.occupied,
  });
  const postsById = keyBy(input.posts, (post) => post.id);
  const results = [];
  for (const action of actions) {
    const original = postsById[action.postId];
    if (original === undefined) continue;
    results.push(
      await applyRuleAction({ action, original, now: options.now }).catch(
        (error: unknown) => {
          console.error("CC rule action failed", action.postId, error);
          return { kind: "failed" as const, postId: action.postId };
        }
      )
    );
  }
  return { actions: results.filter((result) => result !== undefined) };
}
