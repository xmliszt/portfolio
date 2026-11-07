import Link from "next/link";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { Panel } from "@/app/cc/_ui/panel";
import { SyncCampaignFocus } from "@/app/cc/(app)/sync-campaign-focus";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getFocusedCampaign } from "@/lib/cc/data/get-focused-campaign";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { listCampaignSummaries } from "@/lib/cc/data/list-campaign-summaries";
import { listCampaigns } from "@/lib/cc/data/list-campaigns";
import { listCustomPosts } from "@/lib/cc/data/list-custom-posts";
import { formatSgt } from "@/lib/cc/format-sgt";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { Composer } from "./composer";
import { ComposerCampaignSwitcher } from "./composer-campaign-switcher";
import { getComposerPostRows } from "./get-composer-post-rows";
import { getSelectedPost } from "./get-selected-post";
import { isComposerTopLevel } from "./is-composer-top-level";

export const metadata = { title: "Composer" };

export const maxDuration = 300;

type ComposerPageProps = {
  searchParams: Promise<{ post?: string | string[] }>;
};

function getSgtDay(scheduledAt: string | null) {
  return scheduledAt === null
    ? undefined
    : formatSgt({ date: new Date(scheduledAt), pattern: "yyyy-MM-dd" });
}

async function getRequestedCampaignId(postId: string | undefined) {
  if (postId === undefined || !/^[0-9a-f-]{36}$/.test(postId)) {
    return undefined;
  }
  const { data, error } = await createCcServiceClient()
    .from("posts")
    .select("campaign_id")
    .eq("id", postId)
    .maybeSingle();
  if (error) throw error;
  return data?.campaign_id ?? undefined;
}

export default async function ComposerPage(props: ComposerPageProps) {
  await requireCcOwner();
  const searchParams = await props.searchParams;
  const postParam =
    typeof searchParams.post === "string" ? searchParams.post : undefined;
  const header = (
    <PageHeader
      eyebrow={
        <Link href="/" className="text-primary hover:underline">
          ← OVERVIEW
        </Link>
      }
      title="Composer · pre-flight"
    />
  );

  const now = new Date();
  const [focused, campaigns, summaries, requestedCampaignId] =
    await Promise.all([
      getFocusedCampaign(),
      listCampaigns(),
      listCampaignSummaries({ now }),
      getRequestedCampaignId(postParam),
    ]);
  const campaign =
    campaigns.find((row) => row.id === requestedCampaignId) ?? focused;
  const [campaignPosts, customPosts] = await Promise.all([
    campaign === undefined
      ? []
      : listCampaignPosts({ campaignId: campaign.id }),
    listCustomPosts({}),
  ]);
  const posts = [...campaignPosts, ...customPosts];
  const selected = getSelectedPost({
    posts,
    postId: postParam,
    now,
  });
  const post = selected.post;

  if (post === undefined || !isPlatformId(post.platform)) {
    return (
      <>
        {header}
        <Panel title="No drafts">
          <p className="text-muted-foreground px-3 py-2.5">
            {campaign === undefined
              ? "There are no posts yet. Schedule one from New."
              : "This campaign has no posts yet. Schedule one from New."}
          </p>
        </Panel>
      </>
    );
  }

  const childPosts = posts.filter(
    (row) =>
      row.parent_post_id === post.id &&
      row.variant === "mine" &&
      row.kind !== "repost"
  );
  const repostOf =
    post.kind === "repost"
      ? posts.find((row) => row.id === post.parent_post_id)
      : undefined;
  const chatgptVariant =
    post.variant_group === null
      ? undefined
      : posts.find(
          (row) =>
            row.variant === "chatgpt" &&
            row.variant_group === post.variant_group
        );
  const postDay = getSgtDay(post.scheduled_at);
  const sameDayTargets = posts
    .filter(
      (row) =>
        row.id !== post.id &&
        row.platform === post.platform &&
        isComposerTopLevel(row) &&
        row.status !== "skipped" &&
        postDay !== undefined &&
        getSgtDay(row.scheduled_at) === postDay
    )
    .map((row) => row.target ?? "another post");

  return (
    <>
      {header}
      {campaign !== undefined && campaign.id !== focused?.id && (
        <SyncCampaignFocus campaignId={campaign.id} />
      )}
      <Composer
        key={post.id}
        campaignSwitcher={
          campaign === undefined ? undefined : (
            <ComposerCampaignSwitcher
              shownId={campaign.id}
              campaigns={summaries.filter(
                (summary) => summary.isActive || summary.id === campaign.id
              )}
            />
          )
        }
        campaign={
          post.campaign_id === null || campaign === undefined
            ? { id: undefined, name: post.project ?? "", notes: null }
            : { id: campaign.id, name: campaign.name, notes: campaign.notes }
        }
        post={post}
        platformId={post.platform}
        childPosts={childPosts}
        repostOf={repostOf}
        chatgptVariant={chatgptVariant}
        rows={getComposerPostRows(posts)}
        focusPostId={selected.focusPostId}
        sameDayTargets={sameDayTargets}
      />
    </>
  );
}
