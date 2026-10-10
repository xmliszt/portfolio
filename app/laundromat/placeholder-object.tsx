import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

type PlaceholderObjectProps = {
  laidOut: LaidOutObject;
  highlighted: boolean;
};

export function PlaceholderObject(props: PlaceholderObjectProps) {
  const { faces, object } = props.laidOut;
  return (
    <g
      data-object-id={object.id}
      className={cn(
        "transition-[stroke] duration-200 [&_polygon]:[vector-effect:non-scaling-stroke]",
        props.highlighted
          ? "stroke-[var(--lm-ink-hi)]"
          : "stroke-[var(--lm-line)]"
      )}
      strokeWidth={1}
      strokeLinejoin="round"
    >
      <polygon
        className="fill-[var(--lm-face)]"
        points={toSvgPoints(faces.front)}
      />
      <polygon
        className="fill-[var(--lm-wall)]"
        points={toSvgPoints(faces.side)}
      />
      <polygon
        className="fill-[var(--lm-face-top)]"
        points={toSvgPoints(faces.top)}
      />
    </g>
  );
}
