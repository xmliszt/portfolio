import { buildChatgptPrompt } from "@/lib/cc/build-chatgpt-prompt";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import type { PostAsset } from "@/lib/cc/post-asset";
import { REPOST_STRATEGY } from "@/lib/cc/repost-strategy";

import { PLATFORM_PREFLIGHT } from "./platform-preflight";

function getLimitRule(options: {
  platformId: PlatformId;
  language: "en" | "zh";
}) {
  const platform = PLATFORMS[options.platformId];
  const bodyLimit: number | undefined = platform.bodyLimit;
  const titleLimit: number | undefined = platform.titleLimit;
  const isX = options.platformId === "x";
  switch (options.language) {
    case "en":
      return [
        titleLimit === undefined ? undefined : `title ${titleLimit} characters`,
        bodyLimit === undefined
          ? undefined
          : `${titleLimit === undefined ? "" : "text "}${bodyLimit} characters${isX ? ", a link counts as 23 and an emoji as 2" : ""}`,
      ]
        .filter((part) => part !== undefined)
        .join(", ");
    case "zh":
      return [
        titleLimit === undefined ? undefined : `标题 ${titleLimit} 字`,
        bodyLimit === undefined
          ? undefined
          : `${titleLimit === undefined ? "" : "正文 "}${bodyLimit} 字${isX ? "，链接算 23 字，表情算 2 字" : ""}`,
      ]
        .filter((part) => part !== undefined)
        .join("，");
    default: {
      const unhandled: never = options.language;
      return unhandled;
    }
  }
}

/** Return the ChatGPT critique prompt for a draft, or for a repost of `original` a prompt for a new opening, in Chinese when its title or text has Han characters and in English otherwise. */
export function getChatgptPrompt(options: {
  campaignName: string;
  makersNote: string | null;
  platformId: PlatformId;
  title: string;
  copyText: string;
  target: string;
  assets: readonly PostAsset[];
  original: string | undefined;
}) {
  const title = options.title.trim();
  const language = /\p{Script=Han}/u.test(`${title}${options.copyText}`)
    ? "zh"
    : "en";
  const [englishNote = "", chineseNote] = (options.makersNote ?? "").split(
    /^---$/m
  );
  const makersNote = (
    language === "zh" ? (chineseNote ?? englishNote) : englishNote
  ).trim();
  const target = options.target.trim();
  const audience = PLATFORM_PREFLIGHT[options.platformId].audience[language];
  const titleLabel = language === "zh" ? "标题：" : "Title: ";
  return buildChatgptPrompt({
    product: options.campaignName.replace(/\s+launch$/i, ""),
    makersNote,
    platformId: options.platformId,
    limitRule: getLimitRule({ platformId: options.platformId, language }),
    audience: target === "" ? audience : `${target}, ${audience}`,
    assets:
      options.assets.length === 0
        ? [language === "zh" ? "没有素材" : "no media"]
        : options.assets.map((asset) =>
            asset.alt.trim() === ""
              ? asset.file
              : `${asset.file} (${asset.alt.trim()})`
          ),
    draft:
      title === ""
        ? options.copyText
        : `${titleLabel}${title}\n\n${options.copyText}`,
    language,
    repost:
      options.original === undefined
        ? undefined
        : {
            original: options.original,
            how: REPOST_STRATEGY[options.platformId].how,
          },
  });
}
