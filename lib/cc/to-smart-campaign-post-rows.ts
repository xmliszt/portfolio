import keyBy from "lodash/keyBy.js";
import maxBy from "lodash/maxBy.js";
import uniqBy from "lodash/uniqBy.js";

import type { TablesInsert } from "./supabase/__generated__/types";
import type { SmartCampaignMedia } from "./build-smart-campaign-plan";
import type { SmartCampaignDraft } from "./match-smart-campaign-reply";
import type { PlatformId } from "./platforms";
import type { PostAsset } from "./post-asset";

type PostInsert = TablesInsert<{ schema: "command_center" }, "posts">;

type KitAsset = { file: string; alt: string; path: string };

const VIDEO_FILE = /\.(mp4|mov|m4v|webm)$/i;
const IMAGE_FILE = /\.(png|jpe?g|gif|webp|heic)$/i;
const CHINESE_FILE = /-zh\.\w+$/i;

const VIDEO_FORMAT = {
  producthunt: "16x9",
  x: "16x9",
  threads: "9x16",
  instagram: "9x16",
  tiktok: "9x16",
  reddit: "16x9",
  xiaohongshu: "3x4",
  wechat_channels: "9x16",
  wechat_moments: "9x16",
  youtube: "16x9",
  linkedin: "16x9",
  bluesky: "16x9",
} as const satisfies { [id in PlatformId]: string };

function toKitAssets(assets: readonly PostAsset[]) {
  return assets.flatMap((asset): KitAsset[] =>
    asset.path?.includes("/kit/")
      ? [{ file: asset.file, alt: asset.alt, path: asset.path }]
      : []
  );
}

function pickVideo(options: {
  kitAssets: readonly KitAsset[];
  media: "promo" | "features";
  platformId: PlatformId;
  isChinese: boolean;
}) {
  const videos = options.kitAssets.filter(
    (asset) => VIDEO_FILE.test(asset.file) && asset.file.includes(options.media)
  );
  const hasFormat = (asset: KitAsset) =>
    asset.file.includes(VIDEO_FORMAT[options.platformId]);
  const hasLanguage = (asset: KitAsset) =>
    CHINESE_FILE.test(asset.file) === options.isChinese;
  const pick =
    videos.find((asset) => hasFormat(asset) && hasLanguage(asset)) ??
    videos.find(hasLanguage) ??
    videos.find(hasFormat);
  return pick === undefined ? [] : [pick];
}

function pickImages(options: {
  kitPosts: readonly { platformId: PlatformId; assets: readonly PostAsset[] }[];
  platformId: PlatformId;
}) {
  const imageSets = options.kitPosts
    .filter(
      (post) =>
        post.platformId === options.platformId &&
        post.assets.length > 0 &&
        post.assets.every((asset) => IMAGE_FILE.test(asset.file))
    )
    .map((post) => toKitAssets(post.assets));
  return maxBy(imageSets, (assets) => assets.length) ?? [];
}

function pickAssets(options: {
  kitPosts: readonly { platformId: PlatformId; assets: readonly PostAsset[] }[];
  draft: SmartCampaignDraft;
}): KitAsset[] {
  const media: SmartCampaignMedia = options.draft.media;
  switch (media) {
    case "promo":
    case "features":
      return pickVideo({
        kitAssets: uniqBy(
          options.kitPosts.flatMap((post) => toKitAssets(post.assets)),
          (asset) => asset.path
        ),
        media,
        platformId: options.draft.platformId,
        isChinese: options.draft.language === "zh",
      });
    case "images":
      return pickImages({
        kitPosts: options.kitPosts,
        platformId: options.draft.platformId,
      });
    case "none":
      return [];
    default: {
      const unhandled: never = media;
      return unhandled;
    }
  }
}

function toRow(options: {
  campaignId: string;
  link: string | undefined;
  draft: SmartCampaignDraft;
  assets: KitAsset[];
  id: string | undefined;
  parentId: string | undefined;
  wave: number | undefined;
}): PostInsert {
  return {
    ...(options.id === undefined ? {} : { id: options.id }),
    campaign_id: options.campaignId,
    platform: options.draft.platformId,
    kind: options.draft.kind,
    parent_post_id: options.parentId ?? null,
    target: options.draft.target ?? null,
    status: "draft",
    scheduled_by: "planner",
    title: options.draft.title ?? null,
    body: options.draft.body,
    hashtags: options.draft.hashtags,
    link:
      options.draft.platformId === "reddit" && options.draft.kind === "post"
        ? (options.link ?? null)
        : null,
    assets: options.assets,
    wave: options.wave ?? null,
  };
}

/** Return `drafts` as draft rows for `campaignId`, placed by the planner: posts with new ids, then replies and comments linked to their parent's id and wave, with media taken from `kitPosts` files in the bucket's `kit/` folder that match the post's media, platform format and language; also the refs whose media matched no file and the replies and comments whose parent is not in `drafts`. */
export function toSmartCampaignPostRows(options: {
  campaignId: string;
  link: string | undefined;
  drafts: readonly SmartCampaignDraft[];
  kitPosts: readonly { platformId: PlatformId; assets: readonly PostAsset[] }[];
  createId: () => string;
}) {
  const entries = options.drafts.map((draft) => ({
    draft,
    assets: pickAssets({ kitPosts: options.kitPosts, draft }),
  }));
  const parents = entries
    .filter((entry) => entry.draft.kind === "post")
    .map((entry) => ({ ...entry, id: options.createId() }));
  const parentsByRef = keyBy(parents, (entry) => entry.draft.ref);
  const children = entries.flatMap((entry) => {
    if (entry.draft.kind === "post") return [];
    const parent =
      entry.draft.parentRef === undefined
        ? undefined
        : parentsByRef[entry.draft.parentRef];
    return [{ ...entry, parent }];
  });
  return {
    parents: parents.map((entry) =>
      toRow({
        ...options,
        ...entry,
        parentId: undefined,
        wave: entry.draft.wave,
      })
    ),
    children: children.flatMap((entry) =>
      entry.parent === undefined
        ? []
        : [
            toRow({
              ...options,
              ...entry,
              id: undefined,
              parentId: entry.parent.id,
              wave: entry.parent.draft.wave,
            }),
          ]
    ),
    withoutMediaRefs: entries
      .filter(
        (entry) => entry.draft.media !== "none" && entry.assets.length === 0
      )
      .map((entry) => entry.draft.ref),
    orphanRefs: children
      .filter((entry) => entry.parent === undefined)
      .map((entry) => entry.draft.ref),
  };
}
