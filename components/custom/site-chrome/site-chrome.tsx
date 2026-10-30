"use client";

import { useIsFullBleedRoute } from "./use-is-full-bleed-route";

type SiteChromeProps = {
  children: React.ReactNode;
};

export function SiteChrome(props: SiteChromeProps) {
  if (useIsFullBleedRoute()) return null;
  return props.children;
}
