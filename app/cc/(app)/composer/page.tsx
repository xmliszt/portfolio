import Link from "next/link";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { Panel } from "@/app/cc/_ui/panel";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getCurrentCampaign } from "@/lib/cc/data/get-current-campaign";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { formatSgt } from "@/lib/cc/format-sgt";
import { isPlatformId } from "@/lib/cc/is-platform-id";

import { Composer } from "./composer";
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

  const campaign = await getCurrentCampaign();
  const posts =
    campaign === undefined
      ? []
      : await listCampaignPosts({ campaignId: campaign.id });
  const selected = getSelectedPost({
    posts,
    postId: postParam,
    now: new Date(),
  });
  const post = selected.post;

  if (
    campaign === undefined ||
    post === undefined ||
    !isPlatformId(post.platform)
  ) {
    return (
      <>
        {header}
        <Panel title="No drafts">
          <p className="text-muted-foreground px-3 py-2.5">
            {campaign === undefined
              ? "There is no campaign yet."
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
      <Composer
        key={post.id}
        campaign={{
          id: campaign.id,
          name: campaign.name,
          notes: campaign.notes,
        }}
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
