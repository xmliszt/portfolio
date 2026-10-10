import { Suspense } from "react";

import { sceneConfig } from "@/lib/laundromat/scene-config";

import { LaundromatEntry } from "./laundromat-entry";

export default function LaundromatPage() {
  return (
    <main className="size-full">
      <h1 className="sr-only">Laundromat</h1>
      <Suspense>
        <LaundromatEntry config={sceneConfig} />
      </Suspense>
    </main>
  );
}
