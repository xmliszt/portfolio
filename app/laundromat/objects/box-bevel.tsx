import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

type BoxBevelProps = {
  points: ScreenPoint[];
};

export function BoxBevel(props: BoxBevelProps) {
  return (
    <polyline
      className="fill-none stroke-[var(--lm-detail)]"
      strokeWidth={0.75}
      points={toSvgPoints(props.points)}
    />
  );
}
