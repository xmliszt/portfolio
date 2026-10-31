"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useIsFullBleedRoute } from "@/components/custom/site-chrome/use-is-full-bleed-route";

import { Bgm } from "./bgm";

type BgmContextType = {
  bgm: Bgm;
};

const BgmContext = createContext<BgmContextType>({
  get bgm(): Bgm {
    throw new Error("bgm not implemented");
  },
});

export function BgmProvider({ children }: { children: React.ReactNode }) {
  const [bgm] = useState(() => new Bgm());
  const isFullBleedRoute = useIsFullBleedRoute();

  useEffect(() => {
    if (isFullBleedRoute) return;
    bgm.initializeBgms();
    return () => bgm.cleanup();
  }, [bgm, isFullBleedRoute]);

  return <BgmContext.Provider value={{ bgm }}>{children}</BgmContext.Provider>;
}

export function useBgm() {
  const { bgm } = useContext(BgmContext);
  return bgm;
}
