"use client";

import { useIsLaundromatRoute } from "./use-is-laundromat-route";

type SiteChromeProps = {
  children: React.ReactNode;
};

export function SiteChrome(props: SiteChromeProps) {
  if (useIsLaundromatRoute()) return null;
  return props.children;
}
