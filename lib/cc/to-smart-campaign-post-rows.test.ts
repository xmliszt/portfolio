import assert from "node:assert/strict";
import { test } from "node:test";

import { PAWS_LAUNCH_POSTS } from "./testing/paws-launch-posts";
import type { SmartCampaignDraft } from "./match-smart-campaign-reply";
import { toSmartCampaignPostRows } from "./to-smart-campaign-post-rows";

const PAWS_ID = "b56caa48-fa10-45ac-8a74-0552fe47e5d6";

const KIT_POSTS = PAWS_LAUNCH_POSTS.map((post) => ({
  platformId: post.platformId,
  assets: post.files.map((file) => ({
    file,
    alt: "",
    path: file.includes("/")
      ? `${PAWS_ID}/kit/${file}`
      : `${PAWS_ID}/uploads/upload-id/${file}`,
  })),
}));

function buildDraft(
  fields: Pick<SmartCampaignDraft, "ref" | "platformId"> &
    Partial<SmartCampaignDraft>
): SmartCampaignDraft {
  return {
    wave: 1,
    kind: "post",
    parentRef: undefined,
    language: "en",
    title: undefined,
    body: `Text of ${fields.ref}`,
    hashtags: [],
    target: undefined,
    media: "none",
    why: undefined,
    isPlanned: true,
    ...fields,
  };
}

function buildRows(drafts: SmartCampaignDraft[]) {
  const ids = ["id-1", "id-2", "id-3", "id-4", "id-5", "id-6"];
  return toSmartCampaignPostRows({
    campaignId: "new-campaign",
    link: "https://paws.garden",
    drafts,
    kitPosts: KIT_POSTS,
    createId: () => ids.shift() ?? "id-extra",
  });
}

function getFiles(assets: unknown) {
  return Array.isArray(assets)
    ? assets.map((asset) =>
        typeof asset === "object" && asset !== null && "file" in asset
          ? asset.file
          : undefined
      )
    : [];
}

test("links replies and comments to their parent's id and wave", () => {
  const rows = buildRows([
    buildDraft({ ref: "x-2", platformId: "x", wave: 2 }),
    buildDraft({
      ref: "x-2-reply-1",
      platformId: "x",
      kind: "reply",
      parentRef: "x-2",
      wave: undefined,
    }),
    buildDraft({
      ref: "reddit-1",
      platformId: "reddit",
      title: "I made a room",
      target: "r/SideProject",
    }),
    buildDraft({
      ref: "linkedin-1-comment",
      platformId: "linkedin",
      kind: "comment",
      parentRef: "linkedin-1",
    }),
  ]);
  assert.deepEqual(
    rows.parents.map((row) => [row.id, row.platform, row.wave, row.link]),
    [
      ["id-1", "x", 2, null],
      ["id-2", "reddit", 1, "https://paws.garden"],
    ]
  );
  assert.ok(
    rows.parents.every(
      (row) =>
        row.status === "draft" &&
        row.scheduled_by === "planner" &&
        row.campaign_id === "new-campaign"
    )
  );
  assert.equal(rows.parents.at(1)?.target, "r/SideProject");
  assert.equal(rows.parents.at(1)?.title, "I made a room");
  assert.deepEqual(
    rows.children.map((row) => [row.kind, row.parent_post_id, row.wave]),
    [["reply", "id-1", 2]]
  );
  assert.deepEqual(rows.orphanRefs, ["linkedin-1-comment"]);
});

test("takes the kit video that fits the platform's format and language", () => {
  const rows = buildRows([
    buildDraft({ ref: "x-1", platformId: "x", media: "promo" }),
    buildDraft({
      ref: "xiaohongshu-1",
      platformId: "xiaohongshu",
      language: "zh",
      media: "promo",
    }),
    buildDraft({ ref: "threads-1", platformId: "threads", media: "promo" }),
    buildDraft({
      ref: "wechat-channels-2",
      platformId: "wechat_channels",
      language: "zh",
      media: "features",
    }),
    buildDraft({
      ref: "wechat-moments-1",
      platformId: "wechat_moments",
      language: "zh",
      media: "promo",
    }),
  ]);
  assert.deepEqual(
    rows.parents.map((row) => getFiles(row.assets)),
    [
      ["video/paws-promo-16x9.mp4"],
      ["video/paws-promo-3x4-zh.mp4"],
      ["video/paws-promo-9x16.mp4"],
      ["video/paws-features-16x9-zh.mp4"],
      ["video/paws-promo-9x16-zh.mp4"],
    ]
  );
  assert.deepEqual(rows.withoutMediaRefs, []);
});

test("takes the largest image set the platform used, and notes media it cannot find", () => {
  const rows = buildRows([
    buildDraft({ ref: "threads-3", platformId: "threads", media: "images" }),
    buildDraft({ ref: "linkedin-3", platformId: "linkedin", media: "images" }),
    buildDraft({ ref: "tiktok-3", platformId: "tiktok", media: "images" }),
    buildDraft({ ref: "x-1", platformId: "x" }),
  ]);
  assert.deepEqual(
    rows.parents.map((row) => getFiles(row.assets)),
    [
      [
        "social/x-1-fingertip.png",
        "social/x-4-shared.png",
        "social/x-2-make.png",
        "social/x-3-stay.png",
      ],
      ["social/x-1-fingertip.png"],
      [],
      [],
    ]
  );
  assert.deepEqual(rows.withoutMediaRefs, ["tiktok-3"]);
});

test("attaches nothing without kit posts", () => {
  const rows = toSmartCampaignPostRows({
    campaignId: "new-campaign",
    link: undefined,
    drafts: [buildDraft({ ref: "x-1", platformId: "x", media: "promo" })],
    kitPosts: [],
    createId: () => "id-1",
  });
  assert.deepEqual(rows.parents.at(0)?.assets, []);
  assert.deepEqual(rows.withoutMediaRefs, ["x-1"]);
});
