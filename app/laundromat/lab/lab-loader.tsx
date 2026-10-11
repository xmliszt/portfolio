"use client";

import dynamic from "next/dynamic";

export const LabLoader = dynamic(() => import("./laundromat-lab"), {
  ssr: false,
});
