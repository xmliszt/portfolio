import { useEffect, useState } from "react";

import { getStationThumbnailUrls } from "@/lib/laundromat/tv/get-station-thumbnail-urls";
import { resolveStationThumbnail } from "@/lib/laundromat/tv/resolve-station-thumbnail";

function loadImageSize(url: string) {
  return new Promise<{ width: number; height: number } | undefined>(
    (resolve) => {
      const image = new Image();
      image.onload = () =>
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve(undefined);
      image.src = url;
    }
  );
}

export function useStationThumbnail(videoId: string | undefined) {
  const [resolved, setResolved] = useState<{
    videoId: string;
    url: string | undefined;
  }>();

  useEffect(() => {
    if (videoId === undefined) return;
    let isCurrent = true;
    void resolveStationThumbnail({
      urls: getStationThumbnailUrls(videoId),
      loadImageSize,
    }).then((url) => {
      if (isCurrent) setResolved({ videoId, url });
    });
    return () => {
      isCurrent = false;
    };
  }, [videoId]);

  if (resolved === undefined || resolved.videoId !== videoId) return undefined;
  return resolved.url;
}
