import { notFound } from "next/navigation";

import { SoundAudition } from "./sound-audition";

export default function LaundromatSoundsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="size-full overflow-auto">
      <h1 className="sr-only">laundro.cafe sounds</h1>
      <SoundAudition />
    </main>
  );
}
