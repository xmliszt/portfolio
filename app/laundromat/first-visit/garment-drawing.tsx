import type { GarmentKind } from "@/lib/laundromat/first-visit/bedroom-config";
import { cn } from "@/lib/utils";

const THICKNESS_PX = 1.6;

type GarmentPaths = {
  outline: string;
  bands?: string;
  seams: string;
  buttons?: number[];
};

const GARMENT_PATHS = {
  tee: {
    outline:
      "M0.30 0.05 L0.42 0.0 Q0.5 0.09 0.58 0.0 L0.70 0.05 L0.98 0.22 L0.88 0.41 L0.76 0.35 L0.77 0.96 L0.23 0.96 L0.24 0.35 L0.12 0.41 L0.02 0.22 Z",
    seams:
      "M0.42 0.0 Q0.5 0.13 0.58 0.0 M0.24 0.88 L0.77 0.88 M0.24 0.35 L0.3 0.12 M0.76 0.35 L0.7 0.12 M0.4 0.5 Q0.5 0.56 0.62 0.48",
  },
  jeans: {
    outline:
      "M0.2 0.0 L0.8 0.0 L0.84 0.12 L0.9 1.0 L0.58 1.0 L0.5 0.32 L0.42 1.0 L0.1 1.0 L0.16 0.12 Z",
    seams:
      "M0.18 0.09 L0.82 0.09 M0.5 0.09 L0.5 0.3 M0.24 0.1 Q0.28 0.2 0.38 0.22 M0.76 0.1 Q0.72 0.2 0.62 0.22 M0.11 0.92 L0.42 0.92 M0.58 0.92 L0.89 0.92 M0.28 0.4 L0.3 0.8 M0.72 0.4 L0.7 0.8",
  },
  sweater: {
    outline:
      "M0.30 0.08 Q0.5 0.17 0.70 0.08 L0.78 0.12 L1.0 0.56 L0.92 0.63 L0.76 0.37 L0.76 0.93 L0.24 0.93 L0.24 0.37 L0.08 0.63 L0.0 0.56 L0.22 0.12 Z",
    seams:
      "M0.31 0.1 Q0.5 0.22 0.69 0.1 M0.24 0.86 L0.76 0.86 M0.3 0.86 L0.3 0.93 M0.4 0.86 L0.4 0.93 M0.5 0.86 L0.5 0.93 M0.6 0.86 L0.6 0.93 M0.7 0.86 L0.7 0.93 M0.03 0.52 L0.1 0.6 M0.97 0.52 L0.9 0.6 M0.36 0.45 L0.46 0.52 L0.56 0.45 L0.66 0.52",
  },
  towel: {
    outline:
      "M0.04 0.0 L0.96 0.0 Q1.0 0.0 1.0 0.06 L1.0 0.94 Q1.0 1.0 0.94 1.0 L0.06 1.0 Q0.0 1.0 0.0 0.94 L0.0 0.06 Q0.0 0.0 0.04 0.0 Z",
    bands: "M0 0.68 L1 0.68 L1 0.82 L0 0.82 Z",
    seams: "M0 0.5 L1 0.5",
  },
  socks: {
    outline:
      "M0.08 0.0 L0.34 0.0 L0.34 0.5 Q0.35 0.64 0.5 0.66 L0.66 0.68 Q0.76 0.72 0.72 0.84 Q0.68 0.94 0.54 0.92 L0.24 0.88 Q0.06 0.84 0.08 0.64 Z M0.46 0.04 L0.72 0.04 L0.72 0.42 Q0.73 0.5 0.84 0.52 L0.94 0.54 Q1.0 0.58 0.98 0.68 Q0.94 0.76 0.84 0.74 L0.6 0.7 Q0.46 0.66 0.46 0.52 Z",
    bands:
      "M0.08 0.14 L0.34 0.14 L0.34 0.2 L0.08 0.2 Z M0.08 0.26 L0.34 0.26 L0.34 0.3 L0.08 0.3 Z M0.46 0.18 L0.72 0.18 L0.72 0.24 L0.46 0.24 Z M0.46 0.3 L0.72 0.3 L0.72 0.34 L0.46 0.34 Z",
    seams: "M0.08 0.08 L0.34 0.08 M0.46 0.12 L0.72 0.12",
  },
  shirt: {
    outline:
      "M0.3 0.06 L0.42 0.0 L0.5 0.07 L0.58 0.0 L0.7 0.06 L0.94 0.2 L0.98 0.62 L0.88 0.64 L0.8 0.32 L0.78 0.97 L0.22 0.97 L0.2 0.32 L0.12 0.64 L0.02 0.62 L0.06 0.2 Z",
    seams:
      "M0.42 0.0 L0.47 0.14 L0.5 0.07 L0.53 0.14 L0.58 0.0 M0.5 0.14 L0.5 0.97 M0.02 0.56 L0.12 0.58 M0.98 0.56 L0.88 0.58 M0.28 0.3 L0.42 0.3 L0.42 0.4 L0.28 0.4 Z",
    buttons: [0.26, 0.44, 0.62, 0.8],
  },
} satisfies { [kind: string]: GarmentPaths };

type GarmentDrawingProps = {
  kind: GarmentKind;
  floorPlane: string;
  footprint: string;
  offset: { x: number; y: number };
  live: boolean;
  lifted: boolean;
  settling: boolean;
  fading: boolean;
  nudge: "a" | "b" | undefined;
  glowFilter: string;
  liftPx: number;
  settleMs: number;
};

export function GarmentDrawing(props: GarmentDrawingProps) {
  const paths: GarmentPaths = GARMENT_PATHS[props.kind];
  const transition = props.settling
    ? `transform ${props.settleMs}ms cubic-bezier(0.23, 1, 0.32, 1)`
    : "transform 150ms cubic-bezier(0.23, 1, 0.32, 1)";
  return (
    <g
      data-garment={props.kind}
      data-lm-crumple={props.fading ? "" : undefined}
      filter={props.live ? props.glowFilter : undefined}
      style={{
        transform: `translate(${props.offset.x}px, ${props.offset.y - (props.lifted ? props.liftPx : 0)}px)`,
        transition:
          props.offset.x === 0 && props.offset.y === 0 ? transition : "none",
      }}
    >
      <g data-lm-nudge={props.nudge}>
        <g transform={`translate(0 ${THICKNESS_PX})`}>
          <g transform={props.floorPlane}>
            <path
              transform={props.footprint}
              className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
              d={paths.outline}
            />
          </g>
        </g>
        <g transform={props.floorPlane}>
          <g transform={props.footprint}>
            <path
              data-garment-cloth
              className={cn(
                "fill-[var(--lm-face)] transition-[stroke] duration-200",
                props.live
                  ? "stroke-[var(--lm-accent)]"
                  : "stroke-[var(--lm-ink)]/60"
              )}
              d={paths.outline}
            />
            {paths.bands !== undefined && (
              <path
                className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
                d={paths.bands}
              />
            )}
            <path
              className={cn(
                "fill-none transition-[stroke] duration-200",
                props.live
                  ? "stroke-[var(--lm-accent)]/45"
                  : "stroke-[var(--lm-line)]"
              )}
              d={paths.seams}
            />
            {paths.buttons?.map((y) => (
              <circle
                key={y}
                className="fill-[var(--lm-ink)] stroke-none"
                cx={0.53}
                cy={y}
                r={0.012}
              />
            ))}
          </g>
        </g>
      </g>
    </g>
  );
}
