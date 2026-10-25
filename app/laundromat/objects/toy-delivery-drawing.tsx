import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { SoundName } from "@/lib/laundromat/audio/sound-names";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { getToyDepartureSound } from "@/lib/laundromat/toy/get-toy-departure-sound";
import type { ToyBoxView } from "@/lib/laundromat/toy/toy-box-view";
import { TOY_DELIVERY_TIMING } from "@/lib/laundromat/toy/toy-delivery-timing";

import { paintToyDeliveryEffects } from "./paint-toy-delivery-effects";
import { ToyBoxDrawing } from "./toy-box-drawing";
import { TOY_DELIVERY_BALLOONS } from "./toy-delivery-balloons";

type ToyDeliveryDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  details: SceneConfig["details"]["toyBox"];
  view: Extract<ToyBoxView, { kind: "arriving" | "departing" }>;
  paused?: boolean;
  silent: boolean;
};

function progress(options: {
  ms: number;
  startMs: number;
  durationMs: number;
}) {
  return Math.max(
    0,
    Math.min(1, (options.ms - options.startMs) / options.durationMs)
  );
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

export function ToyDeliveryDrawing(props: ToyDeliveryDrawingProps) {
  const id = useId();
  const sound = useSoundBoard();
  const playedCuesRef = useRef<SoundName[]>([]);
  const reducedMotion = useReducedMotion() ?? false;
  const { quality } = useRenderQuality();
  const cargoRef = useRef<SVGGElement>(null);
  const balloonsRef = useRef<SVGGElement>(null);
  const thrustersRef = useRef<SVGGElement>(null);
  const groundRef = useRef<SVGGElement>(null);
  const { object } = props.laidOut;
  const { position, size } = object;
  const { projection, view } = props;
  const { paused, silent } = props;
  const origin = projectIsoPoint({ point: position, projection });
  const anchor = projectIsoPoint({
    point: {
      x: position.x + size.w / 2,
      y: position.y + size.d / 2,
      z: position.z + size.h,
    },
    projection,
  });
  const scale = projection.unit / 80;
  const corners = [0.07, size.w - 0.07].flatMap((x) =>
    [0.07, size.d - 0.07].map((y) => ({
      x: (x - y) * Math.cos(Math.PI / 6) * 80,
      y: (x + y) * 40,
    }))
  );

  useEffect(() => {
    if (paused) return;
    const cargo = cargoRef.current;
    let frameId = 0;
    let lastPaintMs = -Infinity;
    const durationMs =
      view.kind === "arriving"
        ? reducedMotion
          ? TOY_DELIVERY_TIMING.reducedArrivalMs
          : TOY_DELIVERY_TIMING.arrivalMs
        : reducedMotion
          ? TOY_DELIVERY_TIMING.reducedDepartureMs
          : TOY_DELIVERY_TIMING.departureMs;
    const travelPx = Math.max(1100, (origin.y + window.innerHeight) / scale);
    function paint(nowMs: number) {
      const ms = Math.max(0, nowMs - view.startedAtMs);
      const done = ms >= durationMs;
      const cue =
        view.kind === "departing"
          ? getToyDepartureSound({ elapsedMs: ms, reducedMotion })
          : undefined;
      if (
        cue !== undefined &&
        !silent &&
        document.visibilityState === "visible" &&
        !playedCuesRef.current.includes(cue)
      ) {
        playedCuesRef.current = [...playedCuesRef.current, cue];
        sound?.play(cue, { volume: 0.7 });
      }
      if (done || quality !== "lite" || nowMs - lastPaintMs >= 33) {
        lastPaintMs = nowMs;
        const arrival = smooth(
          progress({ ms, startMs: 0, durationMs: TOY_DELIVERY_TIMING.landMs })
        );
        const hover = smooth(
          progress({
            ms,
            startMs: TOY_DELIVERY_TIMING.packMs + TOY_DELIVERY_TIMING.primeMs,
            durationMs: TOY_DELIVERY_TIMING.hoverMs,
          })
        );
        const launch = progress({
          ms,
          startMs:
            TOY_DELIVERY_TIMING.packMs +
            TOY_DELIVERY_TIMING.primeMs +
            TOY_DELIVERY_TIMING.hoverMs,
          durationMs: TOY_DELIVERY_TIMING.launchMs,
        });
        const y = reducedMotion
          ? 0
          : view.kind === "arriving"
            ? -travelPx * (1 - arrival) -
              (ms > TOY_DELIVERY_TIMING.landMs
                ? 4 *
                  Math.sin(
                    progress({
                      ms,
                      startMs: TOY_DELIVERY_TIMING.landMs,
                      durationMs: 400,
                    }) * Math.PI
                  )
                : 0)
            : -36 * hover - travelPx * launch * launch;
        const x = reducedMotion
          ? 0
          : view.kind === "arriving"
            ? Math.sin(ms / 1050) * 13 * (1 - arrival)
            : Math.sin(ms / 170) * 0.6 * hover * (1 - launch);
        const tilt = reducedMotion
          ? 0
          : view.kind === "arriving"
            ? Math.sin(ms / 950) * 3 * (1 - arrival)
            : Math.sin(ms / 220) * 0.35 * hover * (1 - launch);
        const opacity = reducedMotion
          ? view.kind === "arriving"
            ? smooth(Math.min(ms / durationMs, 1))
            : 1 - smooth(progress({ ms, startMs: 400, durationMs: 500 }))
          : view.kind === "departing"
            ? 1 - progress({ ms, startMs: durationMs - 300, durationMs: 300 })
            : 1;
        cargo?.setAttribute(
          "transform",
          `translate(${x * scale} ${y * scale}) rotate(${tilt} ${anchor.x} ${anchor.y})`
        );
        cargo?.setAttribute("opacity", String(opacity));
        paintToyDeliveryEffects({
          balloons: balloonsRef.current,
          thrusters: thrustersRef.current,
          ground: groundRef.current,
          kind: view.kind,
          elapsedMs: ms,
          heightPx: Math.max(0, -y),
          reducedMotion,
          travelPx,
        });
      }
      if (!done && document.visibilityState === "visible")
        frameId = requestAnimationFrame(paint);
    }
    if (document.visibilityState === "visible") paint(performance.now());
    return () => {
      cancelAnimationFrame(frameId);
      cargo?.removeAttribute("transform");
      cargo?.setAttribute("opacity", "0");
    };
  }, [
    view,
    quality,
    reducedMotion,
    scale,
    origin.y,
    anchor.x,
    anchor.y,
    sound,
    paused,
    silent,
  ]);

  return (
    <g data-toy-delivery={view.kind}>
      <defs>
        <filter
          id={`${id}-fog`}
          x="-60%"
          y="-40%"
          width="220%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={2.8} />
        </filter>
        <radialGradient id={`${id}-vapor`}>
          <stop stopColor="#d2dcdf" stopOpacity={0.48} />
          <stop offset={0.3} stopColor="#c2d0d5" stopOpacity={0.3} />
          <stop offset={0.7} stopColor="#b7c8ce" stopOpacity={0.09} />
          <stop offset={1} stopColor="#b7c8ce" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g
        transform={`translate(${origin.x} ${origin.y}) scale(${scale})`}
        stroke="none"
      >
        <g ref={groundRef} opacity={0}>
          {corners.map((corner) => (
            <g
              key={`${corner.x},${corner.y}`}
              transform={`translate(${corner.x} ${corner.y + 8})`}
            >
              <ellipse data-wash fill={`url(#${id}-vapor)`} />
              <ellipse data-ring fill={`url(#${id}-vapor)`} />
            </g>
          ))}
        </g>
      </g>
      <g ref={cargoRef} opacity={0}>
        <g
          transform={`translate(${origin.x} ${origin.y}) scale(${scale})`}
          stroke="none"
        >
          <g ref={thrustersRef} opacity={0}>
            {corners.map((corner) => (
              <g
                key={`${corner.x},${corner.y}`}
                transform={`translate(${corner.x} ${corner.y})`}
              >
                <path
                  d="M -5 -9 L 5 -9 L 4 0 Q 0 3 -4 0 Z"
                  fill="#292f33"
                  stroke="#727c82"
                  strokeWidth={0.7}
                />
                <ellipse cy={0} rx={4} ry={2} fill="#9eafb4" opacity={0.32} />
                <g
                  data-exhaust
                  filter={quality === "lite" ? undefined : `url(#${id}-fog)`}
                >
                  {Array.from({ length: 18 }, (_, index) => (
                    <ellipse
                      key={index}
                      data-vapor
                      fill={`url(#${id}-vapor)`}
                    />
                  ))}
                </g>
              </g>
            ))}
          </g>
        </g>
        <ToyBoxDrawing
          laidOut={props.laidOut}
          projection={projection}
          highlighted={false}
          opening={false}
          closing={
            view.kind === "departing" && view.contents.kind !== "closed"
              ? view
              : undefined
          }
          details={props.details}
        />
        <g
          transform={`translate(${anchor.x} ${anchor.y}) scale(${scale})`}
          stroke="none"
        >
          <g ref={balloonsRef} opacity={0}>
            {TOY_DELIVERY_BALLOONS.map((balloon, index) => (
              <g key={index}>
                <path
                  fill="none"
                  stroke="#b8b4a7"
                  strokeOpacity={0.65}
                  strokeWidth={0.8}
                />
                <g data-envelope>
                  <ellipse
                    rx={balloon.radius}
                    ry={balloon.radius * 1.17}
                    fill={balloon.color}
                  />
                  <ellipse
                    cx={-balloon.radius * 0.3}
                    cy={-balloon.radius * 0.35}
                    rx={balloon.radius * 0.19}
                    ry={balloon.radius * 0.37}
                    fill="#fff"
                    opacity={0.16}
                  />
                  <path
                    d={`M 0 ${balloon.radius * 1.12} l -3 6 h 6 Z`}
                    fill={balloon.color}
                  />
                </g>
              </g>
            ))}
          </g>
        </g>
      </g>
    </g>
  );
}
