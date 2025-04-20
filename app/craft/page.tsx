import { Metadata } from "next";

import { ShadowSubtitle } from "@/app/[slug]/shadow-subtitle";
import { CraftStationLink } from "@/app/craft/components/craft-station-link";
import { stations } from "@/app/craft/stations";
import { openGraph } from "@/app/metadata";

export function generateMetadata(): Metadata {
  return {
    title: "craft | 作坊",
    alternates: { canonical: "https://www.liyuxuan.dev/craft" },
    openGraph: {
      ...openGraph,
      title: "Li Yuxuan | craft",
      description:
        "Where collections of inspiring designs are re-imagined and re-created through hands-on implementation.",
    },
  };
}

export default function CraftPage() {
  return (
    <div className="flex flex-col gap-y-8">
      <article className="prose prose-stone dark:prose-invert">
        <h1 className="group relative">
          craft
          <ShadowSubtitle>作坊</ShadowSubtitle>
        </h1>
        <p>
          I&apos;m building up a crafting space here. The idea is to have an
          interactive coding space, where I can share some of the mini
          experiments I&apos;ve been playing around with. And you can also
          interact with the code to see the live changes.
        </p>
        <p>
          Still building up this space though, as eventually I want to be able
          to upload video recordings of beautiful animations and able to
          playback with adjustable speed alongside the code, so stay tuned :D
        </p>
      </article>

      {/* Project item grids */}
      <div className="flex flex-col gap-y-4">
        {stations.map((station) => (
          <CraftStationLink key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
}
