import { Suspense } from "react";

import { LaundromatScene } from "./laundromat-scene";

export default function LaundromatPage() {
  return (
    <main className="size-full">
      <h1 className="sr-only">Laundromat</h1>
      <Suspense>
        <LaundromatScene />
      </Suspense>
    </main>
  );
}
