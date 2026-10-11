import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

const SWING_EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

function getSwingTransform(options: { hingeX: number; angleDeg: number }) {
  const angle = (options.angleDeg * Math.PI) / 180;
  const alongFace = Math.cos(angle);
  const towardViewer = Math.sin(angle);
  const faceNormal = { x: -1, y: 1 };
  const scaleX = alongFace + towardViewer * faceNormal.x;
  const skewY = towardViewer * faceNormal.y;
  const { hingeX } = options;
  return `matrix(${scaleX} ${skewY} 0 1 ${hingeX - hingeX * scaleX} ${-hingeX * skewY})`;
}

type MachineDoorSwingProps = {
  hingeX: number;
  open: boolean;
  openDeg: number;
  swingMs: number;
  children: React.ReactNode;
};

/** Swing `children`, drawn in a front-face plane, about a vertical hinge at `hingeX` toward the viewer. */
export function MachineDoorSwing(props: MachineDoorSwingProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const groupRef = useRef<SVGGElement>(null);
  const angleDeg = useMotionValue(props.open ? props.openDeg : 0);

  useEffect(
    () =>
      angleDeg.on("change", (deg) => {
        groupRef.current?.setAttribute(
          "transform",
          getSwingTransform({ hingeX: props.hingeX, angleDeg: deg })
        );
      }),
    [angleDeg, props.hingeX]
  );

  useEffect(() => {
    const target = props.open ? props.openDeg : 0;
    const swing = animate(angleDeg, target, {
      duration: prefersReducedMotion ? 0 : props.swingMs / 1000,
      ease: SWING_EASE,
    });
    return () => swing.stop();
  }, [
    props.open,
    props.openDeg,
    props.swingMs,
    prefersReducedMotion,
    angleDeg,
  ]);

  return (
    <g
      ref={groupRef}
      data-door-swing
      transform={getSwingTransform({
        hingeX: props.hingeX,
        angleDeg: angleDeg.get(),
      })}
    >
      {props.children}
    </g>
  );
}
