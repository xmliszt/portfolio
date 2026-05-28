import "server-only";

import { signAppStoreConnectJwt } from "./jwt";

/**
 * Media displayed in an app's Preview section, sourced live from
 * App Store Connect. `video` is the App Preview when present; `screenshots`
 * is the iPhone screenshot set in the order it was uploaded to ASC.
 */
export type LiveAppStoreMedia = {
  video?: {
    url: string;
    posterUrl: string;
  };
  screenshots: string[];
};

const ASC_API_BASE = "https://api.appstoreconnect.apple.com";

/**
 * The largest iPhone display family available wins. Apple keeps adding
 * larger ones (`69` = 6.9" Pro Max class) — list newest first.
 */
const IPHONE_SCREENSHOT_TYPES_PRIORITY = [
  "APP_IPHONE_69",
  "APP_IPHONE_67",
  "APP_IPHONE_65",
  "APP_IPHONE_61",
  "APP_IPHONE_58",
  "APP_IPHONE_55",
  "APP_IPHONE_47",
  "APP_IPHONE_40",
  "APP_IPHONE_35",
];

const IPHONE_PREVIEW_TYPES_PRIORITY = [
  "IPHONE_69",
  "IPHONE_67",
  "IPHONE_65",
  "IPHONE_61",
  "IPHONE_58",
  "IPHONE_55",
  "IPHONE_47",
  "IPHONE_40",
  "IPHONE_35",
];

/**
 * Fetch the App Preview video + iPhone screenshots for the live (or latest)
 * iOS App Store version. Returns `undefined` on any failure so callers can
 * fall back to a hardcoded list — this must never break the page build.
 *
 * Cached on Vercel via `next.revalidate`; rebuilds at most every `revalidate`
 * seconds on ISR.
 */
export async function fetchAppStoreMedia(options: {
  /** The numeric "Apple ID" of the app, same as in `apps.apple.com/.../id{n}`. */
  appId: string;
  /** ISR revalidation window. Defaults to 1 hour. */
  revalidateSeconds?: number;
}): Promise<LiveAppStoreMedia | undefined> {
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
  const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID;
  const privateKeyPem = process.env.APP_STORE_CONNECT_PRIVATE_KEY;

  if (!keyId || !issuerId || !privateKeyPem) {
    // Secrets not configured (e.g. local dev). Silent — caller falls back.
    return undefined;
  }

  const revalidateSeconds = options.revalidateSeconds ?? 3600;

  try {
    const token = await signAppStoreConnectJwt({
      keyId,
      issuerId,
      privateKeyPem,
    });

    async function ascGet<T>(path: string): Promise<T> {
      const response = await fetch(`${ASC_API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: revalidateSeconds },
      });
      if (!response.ok) {
        throw new Error(
          `ASC ${path} → ${response.status} ${response.statusText}`
        );
      }
      return response.json() as Promise<T>;
    }

    // 1. Find the live (or latest) iOS App Store version.
    const versionId = await findLiveVersionId({ appId: options.appId, ascGet });
    if (!versionId) return undefined;

    // 2. Find the en-US (or first) localization.
    const localizationId = await findLocalizationId({ versionId, ascGet });
    if (!localizationId) return undefined;

    // 3. Pull screenshot + preview sets in parallel.
    const [screenshots, video] = await Promise.all([
      fetchScreenshots({ localizationId, ascGet }),
      fetchPreviewVideo({ localizationId, ascGet }),
    ]);

    if (screenshots.length === 0 && !video) return undefined;

    return { video, screenshots };
  } catch (error) {
    // Build logs will show the warning, page will fall back to static list.
    console.warn("[app-store-connect] fetchAppStoreMedia failed:", error);
    return undefined;
  }
}

// --- ASC API response shapes (minimal — only fields we read) ---

type AscResource<TType extends string, TAttributes> = {
  id: string;
  type: TType;
  attributes?: TAttributes;
  relationships?: Record<
    string,
    { data?: { id: string; type: string } | { id: string; type: string }[] }
  >;
};

type AscListResponse<TPrimary, TIncluded = unknown> = {
  data: TPrimary[];
  included?: TIncluded[];
};

type AppStoreVersion = AscResource<
  "appStoreVersions",
  { platform: string; appStoreState?: string; versionString: string }
>;

type Localization = AscResource<
  "appStoreVersionLocalizations",
  { locale: string }
>;

type ImageAsset = {
  templateUrl: string;
  width: number;
  height: number;
};

type ScreenshotSet = AscResource<
  "appScreenshotSets",
  { screenshotDisplayType: string }
>;
type Screenshot = AscResource<
  "appScreenshots",
  {
    fileName?: string;
    imageAsset?: ImageAsset | null;
    assetDeliveryState?: { state?: string };
  }
>;

type PreviewSet = AscResource<
  "appPreviewSets",
  { previewType: string }
>;
type Preview = AscResource<
  "appPreviews",
  {
    fileName?: string;
    videoUrl?: string | null;
    previewImage?: ImageAsset | null;
    assetDeliveryState?: { state?: string };
  }
>;

// --- step helpers ---

type AscGet = <T>(_path: string) => Promise<T>;

async function findLiveVersionId(options: {
  appId: string;
  ascGet: AscGet;
}): Promise<string | undefined> {
  // Prefer READY_FOR_SALE; fall back to the most recently modified version.
  const live = await options.ascGet<AscListResponse<AppStoreVersion>>(
    `/v1/apps/${options.appId}/appStoreVersions?filter[platform]=IOS&filter[appStoreState]=READY_FOR_SALE&limit=1`
  );
  if (live.data.length > 0) return live.data[0].id;

  const any = await options.ascGet<AscListResponse<AppStoreVersion>>(
    `/v1/apps/${options.appId}/appStoreVersions?filter[platform]=IOS&limit=1`
  );
  return any.data.at(0)?.id;
}

async function findLocalizationId(options: {
  versionId: string;
  ascGet: AscGet;
}): Promise<string | undefined> {
  const enUs = await options.ascGet<AscListResponse<Localization>>(
    `/v1/appStoreVersions/${options.versionId}/appStoreVersionLocalizations?filter[locale]=en-US&limit=1`
  );
  if (enUs.data.length > 0) return enUs.data[0].id;

  const any = await options.ascGet<AscListResponse<Localization>>(
    `/v1/appStoreVersions/${options.versionId}/appStoreVersionLocalizations?limit=1`
  );
  return any.data.at(0)?.id;
}

async function fetchScreenshots(options: {
  localizationId: string;
  ascGet: AscGet;
}): Promise<string[]> {
  const sets = await options.ascGet<
    AscListResponse<ScreenshotSet, Screenshot>
  >(
    `/v1/appStoreVersionLocalizations/${options.localizationId}/appScreenshotSets?include=appScreenshots&limit=50`
  );

  const chosenSet = pickByPriority({
    sets: sets.data,
    priority: IPHONE_SCREENSHOT_TYPES_PRIORITY,
    typeOf: (s) => s.attributes?.screenshotDisplayType,
  });
  if (!chosenSet) return [];

  const screenshotRefs =
    (chosenSet.relationships?.appScreenshots?.data as
      | { id: string; type: string }[]
      | undefined) ?? [];

  const screenshotsById = indexById(sets.included ?? []);

  return screenshotRefs
    .map((ref) => screenshotsById[ref.id])
    .filter(
      (s): s is Screenshot =>
        !!s &&
        s.type === "appScreenshots" &&
        s.attributes?.assetDeliveryState?.state === "COMPLETE"
    )
    .map((s) => hydrateTemplateUrl(s.attributes?.imageAsset))
    .filter((url): url is string => typeof url === "string");
}

async function fetchPreviewVideo(options: {
  localizationId: string;
  ascGet: AscGet;
}): Promise<LiveAppStoreMedia["video"]> {
  const sets = await options.ascGet<AscListResponse<PreviewSet, Preview>>(
    `/v1/appStoreVersionLocalizations/${options.localizationId}/appPreviewSets?include=appPreviews&limit=50`
  );

  const chosenSet = pickByPriority({
    sets: sets.data,
    priority: IPHONE_PREVIEW_TYPES_PRIORITY,
    typeOf: (s) => s.attributes?.previewType,
  });
  if (!chosenSet) return undefined;

  const previewRefs =
    (chosenSet.relationships?.appPreviews?.data as
      | { id: string; type: string }[]
      | undefined) ?? [];

  const previewsById = indexById(sets.included ?? []);

  const firstReady = previewRefs
    .map((ref) => previewsById[ref.id])
    .find(
      (p): p is Preview =>
        !!p &&
        p.type === "appPreviews" &&
        p.attributes?.assetDeliveryState?.state === "COMPLETE" &&
        typeof p.attributes?.videoUrl === "string"
    );

  if (!firstReady) return undefined;

  const url = firstReady.attributes?.videoUrl;
  const posterUrl = hydrateTemplateUrl(firstReady.attributes?.previewImage);
  if (!url || !posterUrl) return undefined;

  return { url, posterUrl };
}

// --- tiny helpers ---

function pickByPriority<T>(options: {
  sets: T[];
  priority: string[];
  typeOf: (_item: T) => string | undefined;
}): T | undefined {
  for (const type of options.priority) {
    const match = options.sets.find((s) => options.typeOf(s) === type);
    if (match) return match;
  }
  return options.sets.at(0);
}

function indexById<T extends { id: string }>(items: T[]): { [id: string]: T } {
  return items.reduce<{ [id: string]: T }>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

function hydrateTemplateUrl(
  asset: ImageAsset | null | undefined
): string | undefined {
  if (!asset?.templateUrl) return undefined;
  // Template placeholders: {w} {h} {c} (crop, optional) {f} (format).
  return asset.templateUrl
    .replace("{w}", String(asset.width))
    .replace("{h}", String(asset.height))
    .replace("{c}", "bb")
    .replace("{f}", "png");
}
