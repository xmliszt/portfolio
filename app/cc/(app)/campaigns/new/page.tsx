import mapValues from "lodash/mapValues.js";
import Link from "next/link";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getCurrentCampaign } from "@/lib/cc/data/get-current-campaign";
import { formatSgt } from "@/lib/cc/format-sgt";
import { PLATFORMS } from "@/lib/cc/platforms";
import type { SmartCampaignForm } from "@/lib/cc/smart-campaign-state";

import { SmartCampaign } from "./smart-campaign";

export const metadata = { title: "Smart campaign" };

const CHINESE_FIRST = new Set([
  "xiaohongshu",
  "wechat_channels",
  "wechat_moments",
]);

export default async function SmartCampaignPage() {
  await requireCcOwner();
  const current = await getCurrentCampaign();
  const currentStartDate =
    current?.starts_at === null || current?.starts_at === undefined
      ? undefined
      : formatSgt({ date: new Date(current.starts_at), pattern: "yyyy-MM-dd" });
  const defaultForm: SmartCampaignForm = {
    name: "",
    link: "",
    thoughts: "",
    makersNote: current?.notes ?? "",
    platformIds: [],
    languages: mapValues(PLATFORMS, (platform) =>
      CHINESE_FIRST.has(platform.id) ? "zh" : "en"
    ),
    startDate: "",
    lengthDays: 14,
    media: { promo: true, features: false, images: false, notes: "" },
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/" className="text-primary hover:underline">
            ← OVERVIEW
          </Link>
        }
        title="Smart campaign"
      />
      <SmartCampaign
        defaultForm={defaultForm}
        current={
          current === undefined
            ? undefined
            : { name: current.name, startDate: currentStartDate }
        }
      />
    </>
  );
}
