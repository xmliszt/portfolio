import type { IsoPoint } from "@/lib/laundromat/scene-config";

/** Where the toy car is and which way it faces: `center` in scene iso units, `forward` and `up` as unit vectors. */
export type ToyCarPose = { center: IsoPoint; forward: IsoPoint; up: IsoPoint };
