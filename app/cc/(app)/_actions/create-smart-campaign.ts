"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { DEFAULT_CAMPAIGN_PLAN } from "@/lib/cc/campaign-plan";
import { getCurrentCampaign } from "@/lib/cc/data/get-current-campaign";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import type { SmartCampaignDraft } from "@/lib/cc/match-smart-campaign-reply";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { toCampaignPlanJson } from "@/lib/cc/to-campaign-plan-json";
import { toSmartCampaignPostRows } from "@/lib/cc/to-smart-campaign-post-rows";

type KitSource =
  | { kind: "kit"; campaignName: string }
  | { kind: "other-host"; campaignName: string }
  | { kind: "no-link" }
  | { kind: "no-current" };

function getHost(link: string | null | undefined) {
  if (!link) return undefined;
  try {
    return new URL(link).host.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/** Create a campaign starting on `startDate` (SGT) with the default planner settings and `drafts` as its draft posts, with media from the current campaign's kit when both campaigns link to the same site; return the new campaign's id, how many posts were saved, where media came from, and the refs left without media or without a parent. */
export async function createSmartCampaign(options: {
  name: string;
  link: string;
  makersNote: string;
  startDate: string;
  drafts: readonly SmartCampaignDraft[];
}) {
  await requireCcOwner();
  const name = options.name.trim();
  const link = options.link.trim();
  const makersNote = options.makersNote.trim();
  if (name === "") throw new Error("A campaign needs a name");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) {
    throw new Error("A campaign needs a start date");
  }
  if (options.drafts.length === 0) throw new Error("There are no posts");
  if (options.drafts.some((draft) => !isPlatformId(draft.platformId))) {
    throw new Error("A post has an unknown platform");
  }

  const current = await getCurrentCampaign();
  const host = getHost(link);
  const kitSource: KitSource =
    current === undefined
      ? { kind: "no-current" }
      : host === undefined
        ? { kind: "no-link" }
        : getHost(current.link) === host
          ? { kind: "kit", campaignName: current.name }
          : { kind: "other-host", campaignName: current.name };
  const kitCampaign = kitSource.kind === "kit" ? current : undefined;
  const kitPosts =
    kitCampaign === undefined
      ? []
      : (
          await listCampaignPosts({
            campaignId: kitCampaign.id,
            variant: "mine",
          })
        ).flatMap((post) =>
          isPlatformId(post.platform)
            ? [
                {
                  platformId: post.platform,
                  assets: parsePostAssets(post.assets),
                },
              ]
            : []
        );

  const supabase = createCcServiceClient();
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      name,
      link: link === "" ? null : link,
      notes: makersNote === "" ? null : makersNote,
      starts_at: sgtToUtc({
        date: options.startDate,
        time: "00:00",
      }).toISOString(),
      plan: toCampaignPlanJson({
        ...DEFAULT_CAMPAIGN_PLAN,
        startDate: options.startDate,
      }),
    })
    .select("id")
    .single();
  if (error) throw error;

  const rows = toSmartCampaignPostRows({
    campaignId: campaign.id,
    link: link === "" ? undefined : link,
    drafts: options.drafts,
    kitPosts,
    createId: randomUUID,
  });
  const { error: parentsError } = await supabase
    .from("posts")
    .insert(rows.parents);
  const { error: childrenError } =
    parentsError === null && rows.children.length > 0
      ? await supabase.from("posts").insert(rows.children)
      : { error: null };
  const postsError = parentsError ?? childrenError;
  if (postsError !== null) {
    const { error: deleteError } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", campaign.id);
    if (deleteError !== null) {
      throw new Error(
        `Could not save the posts (${postsError.message}) or remove the empty campaign ${campaign.id} (${deleteError.message})`
      );
    }
    throw postsError;
  }

  revalidatePath("/cc", "layout");
  return {
    campaignId: campaign.id,
    postCount: rows.parents.length + rows.children.length,
    kitSource,
    withoutMediaRefs: rows.withoutMediaRefs,
    orphanRefs: rows.orphanRefs,
  };
}
