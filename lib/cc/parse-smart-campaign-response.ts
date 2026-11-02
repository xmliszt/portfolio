import uniqBy from "lodash/uniqBy.js";

import type {
  SmartCampaignLanguage,
  SmartCampaignMedia,
  SmartCampaignPostKind,
} from "./build-smart-campaign-plan";
import { isJsonObject } from "./is-json-object";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "./platforms";

/** One post from ChatGPT's reply, with its fields checked and normalised. */
export type SmartCampaignReplyPost = {
  ref: string;
  platformId: PlatformId;
  wave: number | undefined;
  kind: SmartCampaignPostKind;
  parentRef: string | undefined;
  language: SmartCampaignLanguage;
  title: string | undefined;
  body: string;
  hashtags: string[];
  target: string | undefined;
  media: SmartCampaignMedia;
  why: string | undefined;
};

type ReadPostResult =
  | { kind: "post"; post: SmartCampaignReplyPost }
  | { kind: "skipped"; warning: string };

type ParseResult =
  | {
      kind: "ok";
      campaign: { name: string | undefined; tagline: string | undefined };
      posts: SmartCampaignReplyPost[];
      warnings: string[];
    }
  | { kind: "error"; message: string };

const STRING_END = /^\s*(?:[:}\]]|\/\/|,\s*(?:["“”„{}\]]|\/\/)|$)/;
const TRAILING_COMMA_END = /^\s*[}\]]/;
const OPENING_QUOTES = new Set(['"', "“", "”", "„"]);
const CLOSING_QUOTES = { '"': ['"'], smart: ['"', "”", "“"] } as const;
const PLATFORM_ALIASES: { [alias: string]: PlatformId } = {
  twitter: "x",
  xhs: "xiaohongshu",
  rednote: "xiaohongshu",
  ph: "producthunt",
  moments: "wechat_moments",
  channels: "wechat_channels",
};
const MEDIA_VALUES = ["promo", "features", "images", "none"] as const;

function extractJson(text: string) {
  const fences = Array.from(
    text.matchAll(/```[^\S\n]*([\w-]*)[^\n]*\n([\s\S]*?)(?:```|$)/g)
  ).map((match) => ({ label: match[1].toLowerCase(), content: match[2] }));
  const fenced =
    fences.findLast((fence) => fence.label === "json") ??
    fences.findLast((fence) => fence.content.includes("{"));
  const source = fenced?.content ?? text;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  return start === -1 || end < start ? undefined : source.slice(start, end + 1);
}

function repairJson(text: string) {
  const output: string[] = [];
  let index = 0;
  let quote: keyof typeof CLOSING_QUOTES | undefined = undefined;
  while (index < text.length) {
    const character = text[index];
    if (quote !== undefined) {
      if (character === "\\") {
        output.push(character, text[index + 1] ?? "");
        index += 2;
        continue;
      }
      const closes = CLOSING_QUOTES[quote].some((close) => close === character);
      if (closes && STRING_END.test(text.slice(index + 1))) {
        output.push('"');
        quote = undefined;
      } else if (character === '"') {
        output.push('\\"');
      } else if (character === "\n") {
        output.push("\\n");
      } else if (character === "\r") {
        output.push("");
      } else if (character === "\t") {
        output.push("\\t");
      } else {
        output.push(character);
      }
      index += 1;
      continue;
    }
    if (OPENING_QUOTES.has(character)) {
      output.push('"');
      quote = character === '"' ? '"' : "smart";
    } else if (character === "/" && text[index + 1] === "/") {
      const lineEnd = text.indexOf("\n", index);
      index = lineEnd === -1 ? text.length : lineEnd;
      continue;
    } else if (
      character === "," &&
      TRAILING_COMMA_END.test(text.slice(index + 1))
    ) {
      output.push("");
    } else {
      output.push(character);
    }
    index += 1;
  }
  return output.join("");
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(repairJson(text));
  }
}

function readString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function readPlatform(value: unknown) {
  const name = readString(value)?.toLowerCase();
  if (name === undefined) return undefined;
  const id = name.replace(/[\s-]+/g, "_");
  return (
    PLATFORM_IDS.find((platformId) => platformId === id) ??
    PLATFORM_IDS.find(
      (platformId) =>
        PLATFORMS[platformId].label.toLowerCase() === name ||
        PLATFORMS[platformId].shortLabel.toLowerCase() === name
    ) ??
    PLATFORM_ALIASES[name.replace(/[\s_-]+/g, "")]
  );
}

function readWave(value: unknown) {
  const wave = typeof value === "string" ? Number(value.trim()) : value;
  return typeof wave === "number" && Number.isInteger(wave) && wave >= 1
    ? wave
    : undefined;
}

function readLanguage(options: { value: unknown; text: string }) {
  const language = readString(options.value)?.toLowerCase();
  if (language === undefined) {
    return /\p{Script=Han}/u.test(options.text) ? "zh" : "en";
  }
  return language.startsWith("zh") ||
    language.startsWith("chinese") ||
    language.includes("中文")
    ? "zh"
    : "en";
}

function readKind(options: {
  value: unknown;
  parentRef: string | undefined;
  platformId: PlatformId;
}): SmartCampaignPostKind {
  const kind = readString(options.value)?.toLowerCase();
  if (kind === "post" || kind === "reply" || kind === "comment") return kind;
  if (options.parentRef === undefined) return "post";
  return options.platformId === "x" ? "reply" : "comment";
}

function readHashtags(value: unknown) {
  const tags: string[] = Array.isArray(value)
    ? value.flatMap((tag) => (typeof tag === "string" ? [tag] : []))
    : typeof value === "string"
      ? value.split(/[\s,，]+/u)
      : [];
  return tags
    .map((tag) => tag.trim().replace(/^[#＃]+/, ""))
    .filter((tag) => tag !== "");
}

function readMedia(value: unknown): SmartCampaignMedia {
  const media = readString(value)?.toLowerCase();
  return MEDIA_VALUES.find((option) => option === media) ?? "none";
}

function readTarget(options: { value: unknown; platformId: PlatformId }) {
  const target = readString(options.value);
  if (target === undefined) return undefined;
  switch (options.platformId) {
    case "reddit":
      return `r/${target.replace(/^\/?r\//i, "")}`;
    case "threads":
      return target;
    default:
      return undefined;
  }
}

function readPost(options: { value: unknown; index: number }): ReadPostResult {
  const label = `Post ${options.index + 1}`;
  if (!isJsonObject(options.value))
    return { kind: "skipped", warning: `${label} is not an object; skipped.` };
  const post = options.value;
  const ref = readString(post.ref);
  if (ref === undefined)
    return { kind: "skipped", warning: `${label} has no ref; skipped.` };
  const platformId = readPlatform(post.platform);
  if (platformId === undefined) {
    return {
      kind: "skipped",
      warning: `${ref} has an unknown platform; skipped.`,
    };
  }
  const body =
    typeof post.body === "string"
      ? post.body
      : typeof post.text === "string"
        ? post.text
        : undefined;
  if (body === undefined || body.trim() === "") {
    return { kind: "skipped", warning: `${ref} has no body; skipped.` };
  }
  const parentRef = readString(post.parent_ref) ?? readString(post.parentRef);
  return {
    kind: "post",
    post: {
      ref,
      platformId,
      wave: readWave(post.wave),
      kind: readKind({ value: post.kind, parentRef, platformId }),
      parentRef,
      language: readLanguage({ value: post.language, text: body }),
      title: readString(post.title),
      body: body.trim(),
      hashtags: readHashtags(post.hashtags),
      target: readTarget({ value: post.target, platformId }),
      media: readMedia(post.media),
      why: readString(post.why),
    },
  };
}

/** Return the campaign and posts in ChatGPT's reply, read from its JSON block with fences, prose around it, trailing commas, `//` comments, unescaped inner quotes and smart quotes tolerated, from the last JSON fence when there are several; posts that cannot be read are left out with a warning each. */
export function parseSmartCampaignResponse(text: string): ParseResult {
  const json = extractJson(text);
  if (json === undefined) {
    return { kind: "error", message: "No JSON block found in the reply." };
  }
  const root = (() => {
    try {
      return parseJson(json);
    } catch {
      return undefined;
    }
  })();
  if (!isJsonObject(root)) {
    return {
      kind: "error",
      message:
        "The JSON block could not be read. Ask ChatGPT to send it again.",
    };
  }
  if (!Array.isArray(root.posts)) {
    return { kind: "error", message: "The JSON has no `posts` list." };
  }
  const read = root.posts.map((value, index) => readPost({ value, index }));
  const posts = read.flatMap((entry) =>
    entry.kind === "post" ? [entry.post] : []
  );
  const duplicates = uniqBy(
    posts.filter(
      (post, index) =>
        posts.findIndex((other) => other.ref === post.ref) !== index
    ),
    (post) => post.ref
  );
  const campaign = isJsonObject(root.campaign) ? root.campaign : {};
  return {
    kind: "ok",
    campaign: {
      name: readString(campaign.name),
      tagline: readString(campaign.tagline),
    },
    posts: uniqBy(posts, (post) => post.ref),
    warnings: [
      ...read.flatMap((entry) =>
        entry.kind === "skipped" ? [entry.warning] : []
      ),
      ...duplicates.map(
        (post) => `${post.ref} appears more than once; kept the first.`
      ),
    ],
  };
}
