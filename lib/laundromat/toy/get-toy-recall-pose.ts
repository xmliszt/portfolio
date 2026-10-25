import { Matrix4, Quaternion, Vector3 } from "three";

import type { ToyCarPose } from "./toy-car-pose";

function rotation(pose: ToyCarPose) {
  const forward = new Vector3(pose.forward.x, pose.forward.y, pose.forward.z);
  const up = new Vector3(pose.up.x, pose.up.y, pose.up.z);
  return new Quaternion().setFromRotationMatrix(
    new Matrix4().makeBasis(
      new Vector3().crossVectors(forward, up),
      forward,
      up
    )
  );
}

export function getToyRecallPose(options: {
  from: ToyCarPose;
  to: ToyCarPose;
  progress: number;
}) {
  if (options.progress <= 0) return options.from;
  if (options.progress >= 1) return options.to;
  const t = options.progress;
  const eased = t * t * (3 - 2 * t);
  const orientation = rotation(options.from).slerp(rotation(options.to), eased);
  return {
    center: {
      x:
        options.from.center.x +
        (options.to.center.x - options.from.center.x) * eased,
      y:
        options.from.center.y +
        (options.to.center.y - options.from.center.y) * eased,
      z:
        options.from.center.z +
        (options.to.center.z - options.from.center.z) * eased,
    },
    forward: new Vector3(0, 1, 0).applyQuaternion(orientation),
    up: new Vector3(0, 0, 1).applyQuaternion(orientation),
  };
}
