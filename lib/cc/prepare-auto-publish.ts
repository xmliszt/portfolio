import type { AutoPublishPlatformId } from "./auto-publish-platforms";
import { countPostCharacters } from "./count-post-characters";
import { getMediaType } from "./get-media-type";
import { PLATFORMS } from "./platforms";
import type { PostAsset } from "./post-asset";
import type { PublishMedia } from "./publish-media";

type PreparedPost =
  | {
      kind: "ok";
      text: string;
      media: PublishMedia[];
      topicTag: string | undefined;
    }
  | { kind: "error"; message: string };

const THREADS_MAX_CAROUSEL = 20;
const X_MAX_IMAGES = 4;
const THREADS_TOPIC_MAX = 50;

function checkMedia(options: {
  platformId: AutoPublishPlatformId;
  media: readonly PublishMedia[];
}) {
  const kinds = options.media.map((item) => item.kind);
  switch (options.platformId) {
    case "x": {
      const isSingleMotion =
        kinds.length === 1 &&
        (kinds.at(0) === "video" || kinds.at(0) === "gif");
      const isImagesOnly =
        kinds.length <= X_MAX_IMAGES && kinds.every((kind) => kind === "image");
      return isSingleMotion || isImagesOnly
        ? undefined
        : "X takes up to 4 images, or 1 video or GIF on its own.";
    }
    case "threads":
      if (kinds.includes("gif")) return "Threads does not take GIF files.";
      return kinds.length > THREADS_MAX_CAROUSEL
        ? "Threads takes up to 20 media files."
        : undefined;
    default: {
      const unhandled: never = options.platformId;
      return unhandled;
    }
  }
}

function getTopicTag(
  target: string | undefined
):
  | { kind: "ok"; tag: string | undefined }
  | { kind: "error"; message: string } {
  const tag = target?.trim().replace(/^#/, "") ?? "";
  if (tag === "") return { kind: "ok", tag: undefined };
  if (tag.length > THREADS_TOPIC_MAX || /[.&]/.test(tag)) {
    return {
      kind: "error",
      message: "The Threads topic must be 1–50 characters with no . or &.",
    };
  }
  return { kind: "ok", tag };
}

/** Return the text, media and Threads topic to publish for a post, or why `platformId` would reject it: text over the limit, media files of an unknown type or not yet uploaded, or a media mix the platform does not take. */
export function prepareAutoPublish(options: {
  platformId: AutoPublishPlatformId;
  text: string;
  assets: readonly PostAsset[];
  target: string | undefined;
}): PreparedPost {
  const limit = PLATFORMS[options.platformId].bodyLimit;
  const length = countPostCharacters({
    text: options.text,
    platformId: options.platformId,
  });
  if (length > limit) {
    return {
      kind: "error",
      message: `The text is ${length} characters; ${PLATFORMS[options.platformId].label} allows ${limit}.`,
    };
  }
  if (options.text.trim() === "" && options.assets.length === 0) {
    return { kind: "error", message: "The post has no text or media." };
  }
  const uploaded = options.assets.flatMap((asset) =>
    asset.path === undefined ? [] : [{ ...asset, path: asset.path }]
  );
  if (uploaded.length < options.assets.length) {
    const missing = options.assets.filter((asset) => asset.path === undefined);
    return {
      kind: "error",
      message: `Upload these files first: ${missing.map((asset) => asset.file).join(", ")}.`,
    };
  }
  const typed = uploaded.map((asset) => ({
    asset,
    type: getMediaType(asset.path),
  }));
  const unknown = typed.filter((item) => item.type === undefined);
  if (unknown.length > 0) {
    return {
      kind: "error",
      message: `Only JPG, PNG, WebP, GIF, MP4 and MOV files can be auto-posted: ${unknown.map((item) => item.asset.file).join(", ")}.`,
    };
  }
  const media = typed.flatMap(({ asset, type }): PublishMedia[] =>
    type === undefined ? [] : [{ ...type, path: asset.path, alt: asset.alt }]
  );
  const mediaError = checkMedia({ platformId: options.platformId, media });
  if (mediaError !== undefined) return { kind: "error", message: mediaError };
  const topic =
    options.platformId === "threads"
      ? getTopicTag(options.target)
      : getTopicTag(undefined);
  if (topic.kind === "error") return topic;
  return { kind: "ok", text: options.text, media, topicTag: topic.tag };
}
