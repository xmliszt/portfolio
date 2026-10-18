import type { IsoPoint } from "@/lib/laundromat/scene-config";

import { getToyTrackPose } from "./get-toy-track-pose";
import { TOY_CAR_CENTER_Z } from "./toy-car-mesh";
import type { ToyCarPose } from "./toy-car-pose";
import { TOY_FLIGHT } from "./toy-flight-timeline";
import { TOY_SET } from "./toy-set-geometry";
import { TOY_TRACK_SECTIONS } from "./toy-track-sections";

export type ToyFlightPhase =
  | "parked"
  | "launch"
  | "climb"
  | "coast"
  | "steady"
  | "descend"
  | "settle"
  | "hop"
  | "spin"
  | "drop"
  | "rest";

/** A cold gas jet on the car: where it leaves the car, which way the gas goes, and how hard it fires from 0 to 1. */
export type ToyThruster = {
  point: IsoPoint;
  direction: IsoPoint;
  strength: number;
};

/** One moment of a run: the phase, the car's pose, the paint slot it belongs in and the thrusters firing. */
export type ToyFlightFrame = {
  phase: ToyFlightPhase;
  pose: ToyCarPose;
  slot: "ramp" | "front";
  thrusters: ToyThruster[];
};

const HALF_LENGTH = 0.28;
const SIDE_NOZZLE = { x: 0.12, y: 0.12 };
const DOWN_NOZZLE = { x: 0.1, y: 0.18, z: -0.05 };

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function rightOf(pose: { forward: IsoPoint; up: IsoPoint }) {
  const { forward, up } = pose;
  return {
    x: forward.y * up.z - forward.z * up.y,
    y: forward.z * up.x - forward.x * up.z,
    z: forward.x * up.y - forward.y * up.x,
  };
}

function onCar(options: { pose: ToyCarPose; offset: IsoPoint }): IsoPoint {
  const { pose, offset } = options;
  const right = rightOf(pose);
  return {
    x:
      pose.center.x +
      right.x * offset.x +
      pose.forward.x * offset.y +
      pose.up.x * offset.z,
    y:
      pose.center.y +
      right.y * offset.x +
      pose.forward.y * offset.y +
      pose.up.y * offset.z,
    z:
      pose.center.z +
      right.z * offset.x +
      pose.forward.z * offset.y +
      pose.up.z * offset.z,
  };
}

function sideJets(options: {
  pose: ToyCarPose;
  strength: number;
  along: [number, number];
}): ToyThruster[] {
  const right = rightOf(options.pose);
  return [1, -1].map((side, index) => ({
    point: onCar({
      pose: options.pose,
      offset: { x: side * SIDE_NOZZLE.x, y: options.along[index], z: 0 },
    }),
    direction: { x: side * right.x, y: side * right.y, z: side * right.z },
    strength: options.strength,
  }));
}

function downJets(options: {
  pose: ToyCarPose;
  strength: number;
}): ToyThruster[] {
  return [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ].map(([side, end]) => ({
    point: onCar({
      pose: options.pose,
      offset: {
        x: side * DOWN_NOZZLE.x,
        y: end * DOWN_NOZZLE.y,
        z: DOWN_NOZZLE.z,
      },
    }),
    direction: { x: 0, y: 0, z: -1 },
    strength: options.strength,
  }));
}

/** Return the car's pose, which paint slot it belongs in (`ramp` while the ramp's overhang can cover it, `front` otherwise), the firing thrusters and the phase, `elapsedMs` into a run of the toy set at `origin`. */
export function getToyFlightFrame(options: {
  elapsedMs: number;
  origin: IsoPoint;
}): ToyFlightFrame {
  const { origin } = options;
  const flight = TOY_FLIGHT;
  const sections = TOY_TRACK_SECTIONS;
  const trackX = origin.x + TOY_SET.track.x;
  const lip = getToyTrackPose(sections.lip);
  const lipEndY = origin.y + lip.y;
  const coastSeconds = flight.coastMs / 1000;
  const landingY = lipEndY + (flight.topSpeed * coastSeconds) / 2;
  const restZ = origin.z + TOY_SET.base.height + TOY_CAR_CENTER_Z;
  const exitZ = origin.z + lip.z - TOY_CAR_CENTER_Z;
  const hoverZ = exitZ + flight.coastRise;
  const hopZ = restZ + flight.hopHeight;
  const facingAway = { x: 0, y: 1, z: 0 };
  const upright = { x: 0, y: 0, z: 1 };

  function onTrack(s: number) {
    const track = getToyTrackPose(s);
    const pose: ToyCarPose = {
      center: {
        x: trackX,
        y: origin.y + track.y + track.normal.y * TOY_CAR_CENTER_Z,
        z: origin.z + track.z + track.normal.z * TOY_CAR_CENTER_Z,
      },
      forward: { x: 0, y: track.tangent.y, z: track.tangent.z },
      up: { x: 0, y: track.normal.y, z: track.normal.z },
    };
    return pose;
  }

  const parked = onTrack(0);
  const phases = [
    { phase: "launch", ms: flight.launchMs },
    { phase: "climb", ms: flight.climbMs },
    { phase: "coast", ms: flight.coastMs },
    { phase: "steady", ms: flight.steadyMs },
    { phase: "descend", ms: flight.descendMs },
    { phase: "settle", ms: flight.settleMs },
    { phase: "hop", ms: flight.hopMs },
    { phase: "spin", ms: flight.spinMs },
    { phase: "drop", ms: flight.dropMs },
    { phase: "rest", ms: flight.restMs },
  ] as const;
  const current = (() => {
    let startMs = 0;
    for (const entry of phases) {
      if (options.elapsedMs < startMs + entry.ms) {
        return {
          phase: entry.phase,
          progress: Math.max(0, (options.elapsedMs - startMs) / entry.ms),
          ms: Math.max(0, options.elapsedMs - startMs),
        };
      }
      startMs += entry.ms;
    }
    return undefined;
  })();

  if (current === undefined) {
    return {
      phase: "parked",
      pose: parked,
      slot: "front",
      thrusters: [],
    };
  }
  const { progress } = current;
  switch (current.phase) {
    case "launch": {
      const seconds = current.ms / 1000;
      const acceleration = flight.topSpeed / (flight.launchMs / 1000);
      return {
        phase: current.phase,
        pose: onTrack((acceleration * seconds * seconds) / 2),
        slot: "front",
        thrusters: [],
      };
    }
    case "climb":
      return {
        phase: current.phase,
        pose: onTrack(sections.floor + (flight.topSpeed * current.ms) / 1000),
        slot: "ramp",
        thrusters: [],
      };
    case "coast": {
      const roll = Math.PI * easeInOut(progress);
      const pose: ToyCarPose = {
        center: {
          x: trackX,
          y:
            lipEndY +
            flight.topSpeed *
              coastSeconds *
              (progress - (progress * progress) / 2),
          z: exitZ + flight.coastRise * smoothstep(progress),
        },
        forward: { x: 0, y: 1, z: 0 },
        up: { x: Math.sin(roll), y: 0, z: -Math.cos(roll) },
      };
      return {
        phase: current.phase,
        pose,
        slot: pose.center.y - HALF_LENGTH < lipEndY ? "ramp" : "front",
        thrusters: sideJets({
          pose,
          strength: progress < 0.8 ? Math.sin((Math.PI * progress) / 0.8) : 0,
          along: [0, 0],
        }),
      };
    }
    case "steady": {
      const pose: ToyCarPose = {
        center: {
          x: trackX,
          y: landingY,
          z: hoverZ + flight.steadyBob * Math.sin(Math.PI * progress),
        },
        forward: { x: 0, y: 1, z: 0 },
        up: { x: 0, y: 0, z: 1 },
      };
      return {
        phase: current.phase,
        pose,
        slot: "front",
        thrusters: sideJets({
          pose,
          strength: 0.5 * Math.sin(Math.PI * progress),
          along: [SIDE_NOZZLE.y, -SIDE_NOZZLE.y],
        }),
      };
    }
    case "descend": {
      const pose: ToyCarPose = {
        center: {
          x: trackX,
          y: landingY,
          z: hoverZ + (restZ - hoverZ) * smoothstep(progress),
        },
        forward: { x: 0, y: 1, z: 0 },
        up: { x: 0, y: 0, z: 1 },
      };
      const strength =
        Math.min(progress / 0.1, 1) * Math.min((1 - progress) / 0.15, 1);
      return {
        phase: current.phase,
        pose,
        slot: "front",
        thrusters: downJets({ pose, strength }),
      };
    }
    case "settle":
      return {
        phase: current.phase,
        pose: {
          center: {
            ...parked.center,
            y: landingY,
            z:
              restZ -
              flight.settleDip * Math.sin(Math.PI * progress) * (1 - progress),
          },
          forward: facingAway,
          up: upright,
        },
        slot: "front",
        thrusters: [],
      };
    case "hop": {
      const pose: ToyCarPose = {
        center: {
          ...parked.center,
          y: landingY,
          z: restZ + (hopZ - restZ) * (1 - (1 - progress) ** 2),
        },
        forward: facingAway,
        up: upright,
      };
      return {
        phase: current.phase,
        pose,
        slot: "front",
        thrusters: downJets({ pose, strength: 1 - 0.4 * progress }),
      };
    }
    case "spin": {
      const yaw = Math.PI * easeInOut(progress);
      const pose: ToyCarPose = {
        center: {
          ...parked.center,
          y: landingY + (parked.center.y - landingY) * easeInOut(progress),
          z: hopZ + flight.steadyBob * Math.sin(Math.PI * progress),
        },
        forward: { x: Math.sin(yaw), y: Math.cos(yaw), z: 0 },
        up: upright,
      };
      return {
        phase: current.phase,
        pose,
        slot: "front",
        thrusters: sideJets({
          pose,
          strength: Math.sin(Math.PI * progress),
          along: [SIDE_NOZZLE.y, -SIDE_NOZZLE.y],
        }),
      };
    }
    case "drop": {
      const pose: ToyCarPose = {
        ...parked,
        center: {
          ...parked.center,
          z: hopZ + (restZ - hopZ) * smoothstep(progress),
        },
      };
      return {
        phase: current.phase,
        pose,
        slot: "front",
        thrusters: downJets({
          pose,
          strength:
            Math.min(progress / 0.15, 1) * Math.min((1 - progress) / 0.2, 1),
        }),
      };
    }
    case "rest":
      return {
        phase: current.phase,
        pose: {
          ...parked,
          center: {
            ...parked.center,
            z:
              restZ -
              flight.settleDip * Math.sin(Math.PI * progress) * (1 - progress),
          },
        },
        slot: "front",
        thrusters: [],
      };
    default: {
      const unhandled: never = current.phase;
      return unhandled;
    }
  }
}
