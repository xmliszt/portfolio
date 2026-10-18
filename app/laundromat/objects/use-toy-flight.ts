import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { SoundName } from "@/lib/laundromat/audio/sound-names";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint } from "@/lib/laundromat/scene-config";
import type { ToyFlightPhase } from "@/lib/laundromat/toy/get-toy-flight-frame";
import { getToyFlightFrame } from "@/lib/laundromat/toy/get-toy-flight-frame";
import { getToyPlumePuffs } from "@/lib/laundromat/toy/get-toy-plume-puffs";
import { TOY_FLIGHT } from "@/lib/laundromat/toy/toy-flight-timeline";
import { TOY_SET } from "@/lib/laundromat/toy/toy-set-geometry";
import { TOY_STILL_POSES } from "@/lib/laundromat/toy/toy-still-poses";

import { paintToyCar } from "./paint-toy-car";

const LITE_FRAME_MS = 33;
const JET_HALF_WIDTH = { top: 0.012, bottom: 0.05 };
const PUFF_SPACING_MS = { full: 35, lite: 90 };
const PHASE_SOUNDS: { [phase in ToyFlightPhase]?: SoundName } = {
  launch: "toy-car-launch",
  coast: "toy-thruster",
  steady: "toy-thruster",
  descend: "toy-hover-jets",
  hop: "toy-thruster",
  spin: "toy-thruster",
  drop: "toy-thruster",
};
/** Fly the toy car in the `rampCarRef` and `frontCarRef` slots, fire jet columns under `jetsRef` and puff gas under `plumesRef` from `runStartedAtMs` (a `performance.now()` time) until the run ends, with sound cues unless `silent`: one frame per display refresh on full, about 30 a second on lite, and a few held poses when the visitor prefers reduced motion. A run interrupted by a re-render resumes where it was. */
export function useToyFlight(options: {
  runStartedAtMs: number;
  rampCarRef: RefObject<SVGGElement | null>;
  frontCarRef: RefObject<SVGGElement | null>;
  jetsRef: RefObject<SVGGElement | null>;
  plumesRef: RefObject<SVGGElement | null>;
  origin: IsoPoint;
  projection: IsoProjection;
  lite: boolean;
  silent: boolean;
}) {
  const {
    runStartedAtMs,
    rampCarRef,
    frontCarRef,
    jetsRef,
    plumesRef,
    origin,
    projection,
    lite,
  } = options;
  const sound = useSoundBoard();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const shownRunRef = useRef(runStartedAtMs);
  const silentRef = useRef(options.silent);
  useEffect(() => {
    silentRef.current = options.silent;
  }, [options.silent]);

  useEffect(() => {
    const slots = { ramp: rampCarRef.current, front: frontCarRef.current };
    const plumes = plumesRef.current;
    if (slots.ramp === null || slots.front === null) return;
    const isFreshRun = shownRunRef.current !== runStartedAtMs;
    shownRunRef.current = runStartedAtMs;
    const resumedAtMs = performance.now() - runStartedAtMs;
    const runMs = prefersReducedMotion
      ? TOY_STILL_POSES.totalMs
      : TOY_FLIGHT.totalMs;
    if (resumedAtMs >= runMs) return;
    const puffs = Array.from(
      plumes?.querySelectorAll<SVGCircleElement>("[data-toy-puff]") ?? []
    );
    const jets = Array.from(
      jetsRef.current?.querySelectorAll<SVGPolygonElement>("polygon") ?? []
    );
    const floorZ = origin.z + TOY_SET.base.height;

    function paint(paintOptions: { elapsedMs: number; withPuffs: boolean }) {
      const { elapsedMs, withPuffs } = paintOptions;
      const frame = getToyFlightFrame({ elapsedMs, origin });
      (["ramp", "front"] as const).forEach((slot) => {
        const group = slots[slot];
        if (group === null) return;
        if (slot !== frame.slot) {
          group.setAttribute("display", "none");
          return;
        }
        group.removeAttribute("display");
        const car = group.querySelector<SVGGElement>("[data-toy-car]");
        if (car !== null)
          paintToyCar({ group: car, pose: frame.pose, projection });
      });
      const downJets = withPuffs
        ? frame.thrusters.filter((thruster) => thruster.direction.z < -0.5)
        : [];
      jets.forEach((polygon, index) => {
        const jet = downJets.at(index);
        if (jet === undefined || jet.strength <= 0) {
          polygon.setAttribute("display", "none");
          return;
        }
        const top = projectIsoPoint({ point: jet.point, projection });
        const bottom = projectIsoPoint({
          point: { ...jet.point, z: floorZ },
          projection,
        });
        const topHalf = JET_HALF_WIDTH.top * projection.unit;
        const bottomHalf = JET_HALF_WIDTH.bottom * projection.unit;
        polygon.removeAttribute("display");
        polygon.setAttribute(
          "points",
          `${top.x - topHalf},${top.y} ${top.x + topHalf},${top.y} ${bottom.x + bottomHalf},${bottom.y} ${bottom.x - bottomHalf},${bottom.y}`
        );
        polygon.setAttribute("opacity", String(jet.strength));
      });
      const alive = withPuffs
        ? getToyPlumePuffs({
            elapsedMs,
            origin,
            spacingMs: lite ? PUFF_SPACING_MS.lite : PUFF_SPACING_MS.full,
          }).slice(-puffs.length)
        : [];
      puffs.forEach((circle, index) => {
        const puff = alive.at(index);
        if (puff === undefined) {
          circle.setAttribute("opacity", "0");
          return;
        }
        const center = projectIsoPoint({ point: puff.center, projection });
        circle.setAttribute("cx", String(center.x));
        circle.setAttribute("cy", String(center.y));
        circle.setAttribute("r", String(puff.radius * projection.unit));
        circle.setAttribute("opacity", String(puff.opacity));
      });
      return frame.phase;
    }

    function showStillPose(index: number) {
      const poseMs = TOY_STILL_POSES.posesMs[index];
      paint({ elapsedMs: poseMs, withPuffs: poseMs < TOY_FLIGHT.totalMs });
    }

    if (prefersReducedMotion) {
      const shownIndex = Math.floor(resumedAtMs / TOY_STILL_POSES.holdMs);
      showStillPose(shownIndex);
      const timers = TOY_STILL_POSES.posesMs.flatMap((_, index) =>
        index <= shownIndex
          ? []
          : [
              window.setTimeout(
                () => showStillPose(index),
                index * TOY_STILL_POSES.holdMs - resumedAtMs
              ),
            ]
      );
      return () => {
        timers.forEach((timer) => window.clearTimeout(timer));
        paint({ elapsedMs: TOY_FLIGHT.totalMs, withPuffs: false });
      };
    }

    let frameId = 0;
    let lastPaintMs = -Infinity;
    let lastPhase = isFreshRun
      ? "parked"
      : getToyFlightFrame({ elapsedMs: resumedAtMs, origin }).phase;
    function step(nowMs: number) {
      const elapsedMs = nowMs - runStartedAtMs;
      const isDone = elapsedMs >= TOY_FLIGHT.totalMs;
      if (isDone || !lite || nowMs - lastPaintMs >= LITE_FRAME_MS) {
        lastPaintMs = nowMs;
        const phase = paint({
          elapsedMs: Math.min(elapsedMs, TOY_FLIGHT.totalMs),
          withPuffs: !isDone,
        });
        const cue = PHASE_SOUNDS[phase];
        if (phase !== lastPhase && cue !== undefined && !silentRef.current) {
          sound?.play(cue);
        }
        lastPhase = phase;
      }
      if (!isDone) frameId = window.requestAnimationFrame(step);
    }
    frameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(frameId);
      paint({ elapsedMs: TOY_FLIGHT.totalMs, withPuffs: false });
    };
  }, [
    runStartedAtMs,
    rampCarRef,
    frontCarRef,
    jetsRef,
    plumesRef,
    origin,
    projection,
    lite,
    prefersReducedMotion,
    sound,
  ]);
}
