import type { CylinderFacet } from "@/lib/laundromat/get-iso-cylinder";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { SHADE_FILL_CLASSES } from "./shade-fill-classes";

type CylinderSidesProps = {
  body: string;
  facets: CylinderFacet[];
};

export function CylinderSides(props: CylinderSidesProps) {
  return (
    <>
      <path className="fill-[var(--lm-face)] stroke-none" d={props.body} />
      {props.facets.map((facet) => (
        <polygon
          key={facet.shade}
          className={`${SHADE_FILL_CLASSES[facet.shade]} stroke-none`}
          points={toSvgPoints(facet.points)}
        />
      ))}
      <path className="fill-none" d={props.body} />
    </>
  );
}
