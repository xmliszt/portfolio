import { TOY_RAMP_CURVE } from "./toy-ramp-curve";
import { TOY_SET } from "./toy-set-geometry";

const { carStartY, ramp } = TOY_SET;
const floor = carStartY - ramp.footY;

/** Arc length, from the car's start, at which each section of the toy track ends. */
export const TOY_TRACK_SECTIONS = {
  floor,
  curve: floor + TOY_RAMP_CURVE.length,
  lip: floor + TOY_RAMP_CURVE.length + ramp.lipLength,
} as const;
