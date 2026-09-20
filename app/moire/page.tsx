import { Metadata } from "next";

import { ShadowSubtitle } from "@/app/[slug]/shadow-subtitle";
import { openGraph } from "@/app/metadata";

import { MoireContent } from "./moire-content";
import { getMoireGraph } from "./moire-data";

export function generateMetadata(): Metadata {
  return {
    title: "moiré | 摩尔纹",
    alternates: { canonical: "https://www.liyuxuan.dev/moire" },
    openGraph: {
      ...openGraph,
      title: "Li Yuxuan | moiré",
      description:
        "Moiré is where I keep everything that catches my attention, and the connections between them. Practice noticing.",
    },
  };
}

export default async function MoirePage() {
  const graph = await getMoireGraph();

  return (
    <article className="prose prose-stone dark:prose-invert relative">
      <h1 className="group relative">
        <a id="top" className="[visibility:hidden] relative -top-16 block"></a>
        moiré
        <ShadowSubtitle>摩尔纹</ShadowSubtitle>
      </h1>
      <MoireContent graph={graph} />
    </article>
  );
}
