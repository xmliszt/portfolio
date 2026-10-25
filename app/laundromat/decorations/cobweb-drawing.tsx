import { getCornerWeb } from "@/lib/laundromat/decorations/get-corner-web";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

type CobwebDrawingProps = {
  object: Extract<SceneDecoration, { kind: "cobweb" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["cobweb"];
};

export function CobwebDrawing(props: CobwebDrawingProps) {
  const { position, size, plane } = props.object;
  if (plane === "corner") {
    const web = getCornerWeb({ position, size, projection: props.projection });
    return (
      <g
        data-lm-decoration={props.object.id}
        fill="none"
        stroke={props.details.color}
        strokeWidth={props.details.threadWidth}
        opacity={props.details.opacity}
      >
        {web.spokes.map((d, index) => (
          <path key={`spoke-${index}`} d={d} />
        ))}
        {web.rings.map((d, index) => (
          <path key={`ring-${index}`} d={d} />
        ))}
      </g>
    );
  }
  const width = (plane === "front" ? size.w : size.d) * props.projection.unit;
  const height = size.h * props.projection.unit;
  const face = getFacePlane({
    plane,
    origin: {
      ...position,
      y: position.y + (plane === "side" ? size.d : 0),
      z: position.z + size.h,
    },
    projection: props.projection,
  });
  function at(coordinates: { angle: number; radius: number }) {
    const { angle, radius } = coordinates;
    return {
      x: Math.cos(angle) * radius * width,
      y: Math.sin(angle) * radius * height,
    };
  }
  const spokes = Array.from({ length: 7 }, (_, index) =>
    at({ angle: (index * Math.PI) / 12, radius: 1 })
  );
  const rings = Array.from({ length: 5 }, (_, ring) => {
    const radius = (ring + 1) / 5;
    return spokes
      .slice(1)
      .map((_, index) => {
        const from = at({ angle: (index * Math.PI) / 12, radius });
        const to = at({ angle: ((index + 1) * Math.PI) / 12, radius });
        const control = at({
          angle: ((index + 0.5) * Math.PI) / 12,
          radius: radius * 0.83,
        });
        return `M${from.x},${from.y} Q${control.x},${control.y} ${to.x},${to.y}`;
      })
      .join(" ");
  });
  return (
    <g
      data-lm-decoration={props.object.id}
      transform={face.transform}
      fill="none"
      stroke={props.details.color}
      strokeWidth={props.details.threadWidth}
      opacity={props.details.opacity}
    >
      {spokes.map((point, index) => (
        <line key={index} x1="0" y1="0" x2={point.x} y2={point.y} />
      ))}
      {rings.map((d, index) => (
        <path key={index} d={d} />
      ))}
      {spokes.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="0.65"
          fill={props.details.color}
          stroke="none"
        />
      ))}
    </g>
  );
}
