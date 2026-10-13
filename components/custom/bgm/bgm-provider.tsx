"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useIsLaundromatRoute } from "@/components/custom/site-chrome/use-is-laundromat-route";

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
  const isLaundromatRoute = useIsLaundromatRoute();

  useEffect(() => {
    if (isLaundromatRoute) return;
    bgm.initializeBgms();
    return () => bgm.cleanup();
  }, [bgm, isLaundromatRoute]);

  return <BgmContext.Provider value={{ bgm }}>{children}</BgmContext.Provider>;
}

export function useBgm() {
  const { bgm } = useContext(BgmContext);
  return bgm;
}
