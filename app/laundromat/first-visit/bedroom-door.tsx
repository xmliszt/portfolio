import { useEffect, useState } from "react";

import { IsoBox } from "@/app/laundromat/objects/iso-box";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getDoorPanel } from "@/lib/laundromat/first-visit/get-door-panel";
import { getDoorSwingDeg } from "@/lib/laundromat/first-visit/get-door-swing-deg";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

const SWING_SETTLE_MS = 1900;
const GAP_HEIGHT = 0.04;
const CASING = 0.1;
const SPILL_REACH = 2.6;
const SPILL_FAN = 0.55;

type BedroomDoorProps = {
  door: BedroomConfig["door"];
  walkIn: BedroomConfig["motion"]["walkIn"];
  projection: IsoProjection;
  ready: boolean;
  opening: boolean;
  swings: boolean;
  jiggles: number;
  glowFilter: string;
  spillFilter: string;
};

export function BedroomDoor(props: BedroomDoorProps) {
  const { door, projection } = props;
  const { unit } = projection;
  const [angleDeg, setAngleDeg] = useState(0);

  useEffect(() => {
    if (!props.opening || !props.swings) return;
    const startedAt = performance.now();
    let frame = 0;
    function step(now: number) {
      const elapsedMs = now - startedAt;
      setAngleDeg(getDoorSwingDeg({ elapsedMs, walkIn: props.walkIn }));
      if (elapsedMs < SWING_SETTLE_MS) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [props.opening, props.swings, props.walkIn]);

  const hingeY = door.fromY + door.width;
  const wall = getFacePlane({
    plane: "side",
    origin: { x: 0, y: hingeY, z: door.height },
    projection,
  });
  const panel = getDoorPanel({ angleDeg, door, projection });
  const openness = Math.sin((angleDeg * Math.PI) / 180);
  const reach = SPILL_REACH * (0.35 + 0.65 * openness);
  function onFloor(x: number, y: number) {
    return projectIsoPoint({ point: { x, y, z: 0 }, projection });
  }
  const spill = [
    onFloor(0, door.fromY),
    onFloor(0, hingeY),
    onFloor(reach, hingeY + SPILL_FAN * (reach / SPILL_REACH)),
    onFloor(reach, door.fromY - SPILL_FAN * (reach / SPILL_REACH)),
  ];
  const spillOpacity = (() => {
    if (props.opening) return 0.18 + 0.3 * openness;
    return props.ready ? 0.12 : 0;
  })();
  const casing = {
    hingePost: {
      position: { x: 0, y: door.fromY - CASING, z: 0 },
      size: { w: CASING, d: CASING, h: door.height },
    },
    latchPost: {
      position: { x: 0, y: hingeY, z: 0 },
      size: { w: CASING, d: CASING, h: door.height },
    },
    header: {
      position: { x: 0, y: door.fromY - CASING, z: door.height },
      size: { w: CASING, d: door.width + CASING * 2, h: CASING },
    },
  };
  function casingPart(part: keyof typeof casing) {
    return (
      <g className="stroke-[var(--lm-line)]">
        <IsoBox
          position={casing[part].position}
          size={casing[part].size}
          projection={projection}
        />
      </g>
    );
  }

  return (
    <g data-bedroom-door strokeLinejoin="round">
      <g transform={`${wall.transform} scale(${unit})`}>
        <rect
          className={cn(
            "transition-[fill] duration-600",
            props.opening ? "fill-[var(--lm-accent-hi)]" : "fill-[var(--lm-bg)]"
          )}
          filter={props.opening ? props.glowFilter : undefined}
          width={door.width}
          height={door.height}
        />
        <rect
          data-lm-breathe={props.ready && !props.opening ? "line" : undefined}
          className={cn(
            "transition-[fill] duration-600",
            props.ready || props.opening
              ? "fill-[var(--lm-accent)]"
              : "fill-[var(--lm-detail)]"
          )}
          filter={props.ready ? props.glowFilter : undefined}
          x={0.02}
          y={door.height - GAP_HEIGHT}
          width={door.width - 0.04}
          height={GAP_HEIGHT}
        />
      </g>
      <polygon
        data-lm-breathe={props.ready && !props.opening ? "spill" : undefined}
        className="pointer-events-none fill-[var(--lm-accent)] transition-opacity duration-500"
        filter={props.spillFilter}
        points={toSvgPoints(spill)}
        style={{ opacity: spillOpacity }}
      />
      {casingPart("hingePost")}
      <polygon
        className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
        points={toSvgPoints(panel.edge)}
      />
      <g transform={panel.transform}>
        <rect
          className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
          width={door.width}
          height={door.height - GAP_HEIGHT}
        />
        <g className="fill-none stroke-[var(--lm-detail)]">
          <rect x={0.16} y={0.18} width={door.width - 0.32} height={0.9} />
          <rect x={0.16} y={1.25} width={door.width - 0.32} height={1.05} />
        </g>
        <rect
          className="fill-black stroke-none"
          width={door.width}
          height={door.height - GAP_HEIGHT}
          opacity={panel.shade}
        />
        {[0.35, 2.15].map((y) => (
          <circle
            key={y}
            className="fill-[var(--lm-line)]"
            cx={0.03}
            cy={y}
            r={0.02}
          />
        ))}
        <g
          data-lm-jiggle={
            props.jiggles === 0 || props.opening
              ? undefined
              : props.jiggles % 2 === 0
                ? "a"
                : "b"
          }
          className="[transform-origin:50%_50%] [transform-box:fill-box]"
        >
          <circle
            className="fill-[var(--lm-face)] stroke-[var(--lm-ink)]"
            cx={door.width - 0.14}
            cy={1.2}
            r={0.07}
          />
          <g
            className={cn(
              "[transform-origin:100%_50%] transition-transform duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] [transform-box:fill-box]",
              props.opening && "[transform:rotate(32deg)]"
            )}
          >
            <rect
              className="fill-[var(--lm-ink)] stroke-none"
              x={door.width - 0.3}
              y={1.18}
              width={0.18}
              height={0.04}
              rx={0.02}
            />
            <circle
              className="fill-[var(--lm-ink)] stroke-none"
              cx={door.width - 0.14}
              cy={1.2}
              r={0.035}
            />
          </g>
        </g>
        <circle
          className={cn(
            "stroke-none transition-[fill] duration-500",
            props.ready ? "fill-[var(--lm-accent)]" : "fill-[var(--lm-detail)]"
          )}
          cx={door.width - 0.14}
          cy={1.34}
          r={0.015}
        />
      </g>
      {casingPart("latchPost")}
      {casingPart("header")}
    </g>
  );
}
