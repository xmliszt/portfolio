import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig, SceneObject } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { getToyBoxClosingFrame } from "@/lib/laundromat/toy/get-toy-box-closing-frame";
import { getToyBoxOpeningFrame } from "@/lib/laundromat/toy/get-toy-box-opening-frame";
import { getToyFlightFrame } from "@/lib/laundromat/toy/get-toy-flight-frame";
import { getToyRecallPose } from "@/lib/laundromat/toy/get-toy-recall-pose";
import type { ToyBoxView } from "@/lib/laundromat/toy/toy-box-view";
import { TOY_DELIVERY_TIMING } from "@/lib/laundromat/toy/toy-delivery-timing";
import { TOY_FLIGHT } from "@/lib/laundromat/toy/toy-flight-timeline";

import { IsoBox } from "./iso-box";
import { paintToyCar } from "./paint-toy-car";
import { partStroke } from "./part-stroke";
import { ToyBoxEndPrint } from "./toy-box-end-print";
import { ToyBoxLidPrint } from "./toy-box-lid-print";
import { ToySetDrawing } from "./toy-set-drawing";

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);
const BAND = { bottom: 0.04, top: 0.12 };
const FRAME_INSET = 0.05;
const SCREW_RADIUS = 0.45;
const HANDLE = { from: 0.38, to: 0.62, width: 0.08 };

function getLidTransform(options: {
  object: SceneObject;
  projection: IsoProjection;
  angleDeg: number;
}) {
  const { position, size } = options.object;
  const angle = (options.angleDeg * Math.PI) / 180;
  const top = projectIsoPoint({
    point: {
      x: position.x + size.w + size.h * Math.sin(angle),
      y: position.y + size.d,
      z: position.z + size.h * Math.cos(angle),
    },
    projection: options.projection,
  });
  const down = {
    x: -Math.sin(angle) * COS_30,
    y: -Math.sin(angle) * SIN_30 + Math.cos(angle),
  };
  return `matrix(${COS_30} ${-SIN_30} ${down.x} ${down.y} ${top.x} ${top.y})`;
}

type ToyBoxDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  opening: boolean;
  closing?: Extract<ToyBoxView, { kind: "departing" }>;
  details: SceneConfig["details"]["toyBox"];
};

export function ToyBoxDrawing(props: ToyBoxDrawingProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { projection, details, laidOut } = props;
  const { object } = laidOut;
  const { position, size } = object;
  const { unit } = projection;
  const boxRef = useRef<SVGGElement>(null);
  const lidRef = useRef<SVGGElement>(null);
  const lidOutsideRef = useRef<SVGGElement>(null);
  const lidInsideRef = useRef<SVGGElement>(null);
  const setRef = useRef<SVGGElement>(null);
  const openedAtMsRef = useRef<number>(undefined);

  useEffect(() => {
    function showLid(angleDeg: number) {
      lidRef.current?.setAttribute(
        "transform",
        getLidTransform({ object, projection, angleDeg })
      );
      const isOutsideUp = angleDeg < 45;
      lidOutsideRef.current?.setAttribute(
        "display",
        isOutsideUp ? "inline" : "none"
      );
      lidInsideRef.current?.setAttribute(
        "display",
        isOutsideUp ? "none" : "inline"
      );
    }
    function fade(progress: number) {
      boxRef.current?.setAttribute("opacity", String(1 - progress));
      setRef.current?.setAttribute("opacity", String(progress));
    }
    const set = setRef.current;
    if (props.closing !== undefined) {
      const closing = props.closing;
      const elapsedMs = Math.max(0, performance.now() - closing.startedAtMs);
      const totalMs = prefersReducedMotion ? 400 : TOY_DELIVERY_TIMING.packMs;
      const car = setRef.current?.querySelector<SVGGElement>(
        '[data-toy-slot="front"] [data-toy-car]'
      );
      const from = getToyFlightFrame({
        elapsedMs: Math.min(
          closing.contents.kind === "open"
            ? closing.startedAtMs - closing.contents.runStartedAtMs
            : Infinity,
          TOY_FLIGHT.totalMs
        ),
        origin: position,
      }).pose;
      const parked = getToyFlightFrame({
        elapsedMs: TOY_FLIGHT.totalMs,
        origin: position,
      }).pose;
      const center = projectIsoPoint({
        point: {
          x: position.x + size.w / 2,
          y: position.y + size.d / 2,
          z: position.z,
        },
        projection,
      });
      const openingFrame =
        closing.contents.kind === "opening"
          ? getToyBoxOpeningFrame({
              elapsedMs: closing.startedAtMs - closing.contents.startedAtMs,
              lidFallMs: details.lidFallMs,
              boxFadeMs: details.boxFadeMs,
              reducedMotion: prefersReducedMotion,
            })
          : undefined;
      let recalled = false;
      function close(ms: number) {
        if (openingFrame !== undefined) {
          const frame = getToyBoxClosingFrame({
            opening: openingFrame,
            elapsedMs: ms,
            lidFallMs: details.lidFallMs,
            boxFadeMs: details.boxFadeMs,
            durationMs: totalMs,
          });
          fade(frame.setOpacity);
          showLid(frame.lidAngleDeg);
          return;
        }
        const recallMs = TOY_DELIVERY_TIMING.recallMs;
        const packed = prefersReducedMotion
          ? Math.min(ms / totalMs, 1)
          : Math.max(0, Math.min((ms - recallMs) / 750, 1));
        fade(1 - packed);
        showLid(
          prefersReducedMotion
            ? 0
            : 90 * (1 - Math.max(0, Math.min((ms - recallMs - 650) / 850, 1)))
        );
        const scale = prefersReducedMotion ? 1 : 1 - 0.24 * packed;
        setRef.current?.setAttribute(
          "transform",
          `translate(${center.x} ${center.y}) scale(${scale}) translate(${-center.x} ${-center.y})`
        );
        if (
          car !== undefined &&
          car !== null &&
          !prefersReducedMotion &&
          !recalled
        ) {
          recalled = ms >= recallMs;
          paintToyCar({
            group: car,
            projection,
            pose: getToyRecallPose({
              from,
              to: parked,
              progress: ms / recallMs,
            }),
          });
        }
      }
      close(Math.min(elapsedMs, totalMs));
      const packing = animate(Math.min(elapsedMs, totalMs), totalMs, {
        duration: Math.max(0, totalMs - elapsedMs) / 1000,
        ease: "linear",
        onUpdate: close,
      });
      return () => {
        packing.stop();
        showLid(0);
        fade(0);
        set?.removeAttribute("transform");
      };
    }
    if (!props.opening) {
      openedAtMsRef.current = undefined;
      showLid(0);
      fade(0);
      return;
    }
    openedAtMsRef.current ??= performance.now();
    const elapsedMs = performance.now() - openedAtMsRef.current;
    const fallMs = prefersReducedMotion ? 0 : details.lidFallMs;
    const totalMs = fallMs + details.boxFadeMs;
    function open(ms: number) {
      const frame = getToyBoxOpeningFrame({
        elapsedMs: ms,
        lidFallMs: details.lidFallMs,
        boxFadeMs: details.boxFadeMs,
        reducedMotion: prefersReducedMotion,
      });
      showLid(frame.lidAngleDeg);
      fade(frame.setOpacity);
    }
    open(elapsedMs);
    const opening = animate(Math.min(elapsedMs, totalMs), totalMs, {
      duration: Math.max(0, totalMs - elapsedMs) / 1000,
      ease: "linear",
      onUpdate: open,
    });
    return () => {
      opening.stop();
      showLid(0);
      fade(0);
    };
  }, [
    props.opening,
    props.closing,
    object,
    position,
    size,
    projection,
    details,
    prefersReducedMotion,
  ]);

  const faces = getBoxFaces({ position, size, projection });
  const lidWidthPx = size.d * unit;
  const lidHeightPx = size.h * unit;
  const insetPx = FRAME_INSET * unit;
  const bandTopPx = (size.h - BAND.top) * unit;
  const bandBottomPx = (size.h - BAND.bottom) * unit;
  const end = getFacePlane({
    plane: "front",
    origin: { x: position.x, y: position.y + size.d, z: position.z + size.h },
    projection,
  });
  const top = getFacePlane({
    plane: "top",
    origin: { x: position.x, y: position.y, z: position.z + size.h },
    projection,
  });
  const screws = [insetPx * 0.5, lidWidthPx - insetPx * 0.5].flatMap((x) =>
    [insetPx * 0.5, lidHeightPx - insetPx * 0.5].map((y) => ({ x, y }))
  );
  const handleWidthPx = HANDLE.width * unit;
  const lightStyle: React.CSSProperties & { "--lm-toy-light": string } = {
    "--lm-toy-light": details.lightColor,
  };

  return (
    <g data-toy-box strokeLinejoin="round" style={lightStyle}>
      <g ref={boxRef}>
        <g className={partStroke(props.highlighted)} strokeWidth={1}>
          <IsoBox position={position} size={size} projection={projection} />
        </g>
        <polygon
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          strokeWidth={0.6}
          points={toSvgPoints(faces.side)}
        />
        <g transform={end.transform}>
          <rect
            x={0}
            y={bandTopPx}
            width={size.w * unit}
            height={bandBottomPx - bandTopPx}
            className="fill-[var(--lm-toy-light)] stroke-none opacity-80"
          />
          <ToyBoxEndPrint
            x={insetPx}
            y={insetPx}
            width={size.w * unit - 2 * insetPx}
            height={bandTopPx - insetPx * 2}
          />
        </g>
        <g transform={top.transform}>
          <rect
            x={(size.w * unit - handleWidthPx) / 2}
            y={size.d * unit * HANDLE.from}
            width={handleWidthPx}
            height={size.d * unit * (HANDLE.to - HANDLE.from)}
            rx={handleWidthPx / 2}
            className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
            strokeWidth={0.6}
          />
          {[HANDLE.from, HANDLE.to].map((along) => (
            <rect
              key={along}
              x={(size.w * unit - handleWidthPx * 2) / 2}
              y={size.d * unit * along - 1.5}
              width={handleWidthPx * 2}
              height={3}
              rx={0.6}
              className="fill-[var(--lm-shade-2)] stroke-[var(--lm-detail)]"
              strokeWidth={0.5}
            />
          ))}
        </g>
        <g
          ref={lidRef}
          transform={getLidTransform({ object, projection, angleDeg: 0 })}
        >
          <g ref={lidInsideRef} display="none">
            <rect
              x={0}
              y={0}
              width={lidWidthPx}
              height={lidHeightPx}
              className="fill-[var(--lm-shade-2)] stroke-[var(--lm-line)]"
              strokeWidth={1}
            />
            <rect
              x={insetPx}
              y={insetPx}
              width={lidWidthPx - 2 * insetPx}
              height={lidHeightPx - 2 * insetPx}
              className="fill-none stroke-[var(--lm-detail)]"
              strokeWidth={0.5}
            />
          </g>
          <g ref={lidOutsideRef}>
            <rect
              x={0}
              y={0}
              width={lidWidthPx}
              height={lidHeightPx}
              className={`fill-[var(--lm-wall)] ${partStroke(props.highlighted)}`}
              strokeWidth={1}
            />
            <rect
              x={0}
              y={bandTopPx}
              width={lidWidthPx}
              height={bandBottomPx - bandTopPx}
              className="fill-[var(--lm-toy-light)] stroke-none opacity-80"
            />
            <rect
              x={insetPx}
              y={insetPx}
              width={lidWidthPx - 2 * insetPx}
              height={bandTopPx - insetPx * 2}
              rx={1}
              className="fill-[var(--lm-shade-1)] stroke-[var(--lm-detail)]"
              strokeWidth={0.5}
            />
            <ToyBoxLidPrint
              x={insetPx}
              y={insetPx}
              width={lidWidthPx - 2 * insetPx}
              height={bandTopPx - insetPx * 2}
            />
            <rect
              x={lidWidthPx / 2 - 3}
              y={-0.6}
              width={6}
              height={2.4}
              rx={0.6}
              className="fill-[var(--lm-shade-2)] stroke-[var(--lm-line)]"
              strokeWidth={0.5}
            />
            {screws.map((screw) => (
              <g key={`${screw.x},${screw.y}`}>
                <circle
                  cx={screw.x}
                  cy={screw.y}
                  r={SCREW_RADIUS * 2}
                  className="fill-none stroke-[var(--lm-detail)]"
                  strokeWidth={0.4}
                />
                <circle
                  cx={screw.x}
                  cy={screw.y}
                  r={SCREW_RADIUS}
                  className="fill-[var(--lm-line)] stroke-none"
                />
              </g>
            ))}
          </g>
        </g>
      </g>
      {(props.opening || props.closing !== undefined) && (
        <g ref={setRef} opacity={0}>
          <ToySetDrawing
            laidOut={laidOut}
            projection={projection}
            highlighted={false}
            runStartedAtMs={-Infinity}
            silent
            details={details}
          />
        </g>
      )}
    </g>
  );
}
