import { useLayoutEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import {
  getCoinDropMs,
  getCoinDropPose,
} from "@/lib/laundromat/tip/get-coin-drop-pose";
import { METAL_TONES } from "@/lib/laundromat/tip/tip-coin-metals";
import type { CoinMachinePhase } from "@/lib/laundromat/tip/tip-token";

const RADIUS_PX = 2.7;
const THICKNESS_PX = 0.9;
const EDGE_LAYERS = { full: 4, lite: 1 };
const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);
const TOWARD_VIEWER = { x: -COS_30, y: SIN_30 };
const ACROSS = { x: COS_30, y: SIN_30 };

type CoinMachineTokenProps = {
  phase: CoinMachinePhase;
  rest: ScreenPoint;
  dropPx: number;
  outFromFacePx: number;
};

function useDropMs(options: { phase: CoinMachinePhase; dropPx: number }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const totalMs = getCoinDropMs({ dropPx: options.dropPx });
  const [atMs, setAtMs] = useState(totalMs);
  const isDispensing = options.phase.kind === "dispensing";
  useLayoutEffect(() => {
    if (!isDispensing || prefersReducedMotion) {
      setAtMs(totalMs);
      return;
    }
    const startedAt = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsedMs = now - startedAt;
      setAtMs(Math.min(elapsedMs, totalMs));
      if (elapsedMs < totalMs) frame = requestAnimationFrame(tick);
    });
    setAtMs(0);
    return () => cancelAnimationFrame(frame);
  }, [isDispensing, prefersReducedMotion, totalMs]);
  return atMs;
}

/** Draw the dispensed token once `phase` is `dispensing` or `token-in-tray`: a brass coin with a milled edge that drops `dropPx` from the chute, `outFromFacePx` nearer the face at the top, bounces, tips over and wobbles flat onto the tray at `rest`; nothing otherwise. */
export function CoinMachineToken(props: CoinMachineTokenProps) {
  const { quality } = useRenderQuality();
  const atMs = useDropMs({ phase: props.phase, dropPx: props.dropPx });
  switch (props.phase.kind) {
    case "idle":
    case "inserting":
      return null;
    case "dispensing":
    case "token-in-tray":
      break;
    default: {
      const unhandled: never = props.phase;
      return unhandled;
    }
  }
  const pose = getCoinDropPose({ dropPx: props.dropPx, atMs });
  const tilt = (pose.tiltDeg * Math.PI) / 180;
  const down = {
    x: Math.sin(tilt) * TOWARD_VIEWER.x,
    y: Math.cos(tilt) + Math.sin(tilt) * TOWARD_VIEWER.y,
  };
  const normal = {
    x: Math.cos(tilt) * TOWARD_VIEWER.x,
    y: Math.cos(tilt) * TOWARD_VIEWER.y - Math.sin(tilt),
  };
  const backFromViewer = (props.outFromFacePx * pose.heightPx) / props.dropPx;
  const contact = {
    x:
      props.rest.x +
      RADIUS_PX * TOWARD_VIEWER.x -
      backFromViewer * TOWARD_VIEWER.x,
    y:
      props.rest.y +
      RADIUS_PX * TOWARD_VIEWER.y -
      backFromViewer * TOWARD_VIEWER.y -
      pose.heightPx,
  };
  const center = {
    x: contact.x - RADIUS_PX * down.x,
    y: contact.y - RADIUS_PX * down.y,
  };
  const tones = METAL_TONES.brass;
  const layers = EDGE_LAYERS[quality];
  function face(offset: number) {
    return `matrix(${ACROSS.x} ${ACROSS.y} ${down.x} ${down.y} ${center.x - normal.x * offset} ${center.y - normal.y * offset})`;
  }
  return (
    <g pointerEvents="none" stroke="none">
      {Array.from({ length: layers }, (_, index) => {
        const offset = THICKNESS_PX * (1 - index / layers);
        return (
          <circle
            key={index}
            transform={face(offset)}
            r={RADIUS_PX}
            fill={index === 0 ? tones.edge : tones.dark}
          />
        );
      })}
      <g transform={face(0)}>
        <circle
          r={RADIUS_PX}
          fill={tones.base}
          stroke={tones.dark}
          strokeWidth={0.25}
        />
        <circle
          r={RADIUS_PX * 0.66}
          fill="none"
          stroke={tones.edge}
          strokeWidth={0.2}
          opacity={0.7}
        />
        <path
          d={`M ${-RADIUS_PX * 0.7} ${-RADIUS_PX * 0.2} A ${RADIUS_PX * 0.75} ${RADIUS_PX * 0.75} 0 0 1 ${RADIUS_PX * 0.2} ${-RADIUS_PX * 0.7}`}
          fill="none"
          stroke={tones.light}
          strokeWidth={0.35}
          strokeLinecap="round"
          opacity={0.9}
        />
      </g>
    </g>
  );
}
