"use server";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { signAssetUrls } from "@/lib/cc/data/sign-asset-urls";

const EXPIRES_IN_S = 60 * 60;

/** Return, for each uploaded asset path, a signed URL to show it and one to download it, both valid for an hour. */
export async function getAssetUrls(options: { paths: string[] }) {
  await requireCcOwner();
  const [view, download] = await Promise.all([
    signAssetUrls({
      paths: options.paths,
      expiresInS: EXPIRES_IN_S,
      isDownload: false,
    }),
    signAssetUrls({
      paths: options.paths,
      expiresInS: EXPIRES_IN_S,
      isDownload: true,
    }),
  ]);
  return Object.fromEntries(
    options.paths.flatMap(
      (path): [string, { view: string; download: string }][] => {
        const viewUrl = view[path];
        const downloadUrl = download[path];
        return viewUrl === undefined || downloadUrl === undefined
          ? []
          : [[path, { view: viewUrl, download: downloadUrl }]];
      }
    )
  );
}
