import { Metadata } from "next";

import { openGraph } from "@/app/metadata";
import { CustomLink } from "@/components/ui/custom-link";
import { Ratings } from "@/components/ui/ratings";

import { WiggleContainer } from "./wiggle-container";

export function generateMetadata(): Metadata {
  return {
    title: "ThreeJS Wiggle Sticker Effect | ThreeJS 动态贴纸效果",
    alternates: {
      canonical: "https://www.liyuxuan.dev/playground/wiggle-sticker-effect",
    },
    openGraph: {
      ...openGraph,
      title: "Li Yuxuan | ThreeJS Wiggle Sticker Effect",
      description:
        "This effect was inspired from X post from kmkota0. First, we use Blender to create a 3D model of the sticker. Then, we use ThreeJS with Wiggle library to create a dynamic effect for the sticker in code.",
    },
  };
}

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <h1 className="text-center font-bold">ThreeJS Wiggle Sticker Effect</h1>
      <p>
        This effect was inspired from X post from{" "}
        <CustomLink href="https://x.com/kmkota0/status/1833159556060328192?s=46&t=7_ux3ylNTDdqC2wZItPGRg">
          kmkota0
        </CustomLink>
        . First, we use{" "}
        <CustomLink href="https://www.blender.org/">Blender</CustomLink> to
        create a 3D model of the sticker. Then, we use{" "}
        <CustomLink href="https://threejs.org/">ThreeJS</CustomLink> with{" "}
        <CustomLink href="https://wiggle.three.tools/">Wiggle</CustomLink>{" "}
        library to create a dynamic effect for the sticker in code.
      </p>

      <p className="w-full text-left">
        The code for this effect was inspired by the{" "}
        <CustomLink href="https://codesandbox.io/p/devbox/wiggle-bones-for-three-js-example-pv98hd">
          ThreeJS Wiggle official working demo
        </CustomLink>{" "}
        .
      </p>

      {/* container */}
      <WiggleContainer />

      <Ratings id="wiggle-sticker-effect" />
    </div>
  );
}
