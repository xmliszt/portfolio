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
          Craft is an interactive space, where I collect and re-build little
          ideas into live. Craft focuses more on the animation and interaction
          kinds of things. The interactive code editor makes it possible to not
          just showcase, but also allow visitors to participate, to build on top
          of what I have. So, have fun exploring and building!
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
