import { TOY_RAMP_CURVE } from "./toy-ramp-curve";
import { TOY_SET } from "./toy-set-geometry";
import { TOY_TRACK_SECTIONS } from "./toy-track-sections";

export type TrackPose = {
  y: number;
  z: number;
  tangent: { y: number; z: number };
  normal: { y: number; z: number };
};

function angleAtLength(length: number) {
  const { cumulativeLengths, samples } = TOY_RAMP_CURVE;
  const index = Math.max(
    0,
    Math.min(
      samples - 1,
      cumulativeLengths.findIndex((total) => total >= length) - 1
    )
  );
  const from = cumulativeLengths[index];
  const to = cumulativeLengths[index + 1];
  const fraction = to === from ? 0 : (length - from) / (to - from);
  return (Math.PI * (index + fraction)) / samples;
}

/** Return the riding surface's point, direction of travel and normal (pointing to the side the car rides on) at arc length `s` from the car's start, clamped to the track. */
export function getToyTrackPose(s: number): TrackPose {
  const { base, carStartY, ramp } = TOY_SET;
  const sections = TOY_TRACK_SECTIONS;
  const along = Math.min(Math.max(s, 0), sections.lip);
  if (along <= sections.floor) {
    return {
      y: carStartY - along,
      z: base.height,
      tangent: { y: -1, z: 0 },
      normal: { y: 0, z: 1 },
    };
  }
  const topZ = base.height + ramp.rise;
  if (along >= sections.curve) {
    return {
      y: ramp.footY + (along - sections.curve),
      z: topZ,
      tangent: { y: 1, z: 0 },
      normal: { y: 0, z: -1 },
    };
  }
  const angle = angleAtLength(along - sections.floor);
  const direction = {
    y: -ramp.reach * Math.cos(angle),
    z: (ramp.rise / 2) * Math.sin(angle),
  };
  const length = Math.hypot(direction.y, direction.z);
  const tangent = { y: direction.y / length, z: direction.z / length };
  return {
    y: ramp.footY - ramp.reach * Math.sin(angle),
    z: base.height + (ramp.rise / 2) * (1 - Math.cos(angle)),
    tangent,
    normal: { y: tangent.z, z: -tangent.y },
  };
}
