import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { CRAYON_FILTER_MARGIN } from "./crayon-filter-margin";

const RED_TO_ALPHA = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0";

type CrayonFilterProps = {
  id: string;
  crayon: SceneConfig["notebook"]["doodle"]["crayon"];
  seed: number;
};

/** Define an SVG filter `id` that roughens the edges of what it is applied to and cuts it with crayon grain and patches, with the noise picked by `seed`. */
export function CrayonFilter(props: CrayonFilterProps) {
  return (
    <defs>
      <filter
        id={props.id}
        filterUnits="userSpaceOnUse"
        x={`${-CRAYON_FILTER_MARGIN * 100}%`}
        y={`${-CRAYON_FILTER_MARGIN * 100}%`}
        width={`${100 + CRAYON_FILTER_MARGIN * 200}%`}
        height={`${100 + CRAYON_FILTER_MARGIN * 200}%`}
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency={props.crayon.grainFrequency}
          numOctaves={2}
          seed={props.seed}
          result="grain"
        />
        <feTurbulence
          type="fractalNoise"
          baseFrequency={props.crayon.patchFrequency}
          numOctaves={2}
          seed={props.seed + 7}
          result="patches"
        />
        <feTurbulence
          type="turbulence"
          baseFrequency={props.crayon.wobbleFrequency}
          numOctaves={1}
          seed={props.seed + 13}
          result="wobble"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="wobble"
          scale={props.crayon.edgeRoughnessPx}
          xChannelSelector="R"
          yChannelSelector="G"
          result="rough"
        />
        <feColorMatrix
          in="grain"
          type="matrix"
          values={RED_TO_ALPHA}
          result="grainAlpha"
        />
        <feColorMatrix
          in="patches"
          type="matrix"
          values={RED_TO_ALPHA}
          result="patchAlpha"
        />
        <feComposite
          in="grainAlpha"
          in2="patchAlpha"
          operator="arithmetic"
          k1={0}
          k2={props.crayon.grainWeight}
          k3={props.crayon.patchWeight}
          k4={props.crayon.coverageOffset}
          result="coverage"
        />
        <feComposite in="rough" in2="coverage" operator="in" />
      </filter>
    </defs>
  );
}
