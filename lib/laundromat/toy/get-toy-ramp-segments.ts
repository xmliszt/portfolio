import { getToyTrackPose } from "./get-toy-track-pose";
import { TOY_TRACK_SECTIONS } from "./toy-track-sections";

const CURVE_PIECES = 36;

/** Return the ramp cut into short pieces from the foot to the lip, each with its two end poses and `ridesVisible`: `true` if the viewer sees its riding surface; `false` when the piece hangs over and shows its back. */
export function getToyRampSegments() {
  const sections = TOY_TRACK_SECTIONS;
  const cuts = [
    ...Array.from({ length: CURVE_PIECES }, (_, index) => ({
      from:
        sections.floor +
        ((sections.curve - sections.floor) * index) / CURVE_PIECES,
      to:
        sections.floor +
        ((sections.curve - sections.floor) * (index + 1)) / CURVE_PIECES,
    })),
    { from: sections.curve, to: sections.lip },
  ];
  return cuts.map((cut) => {
    const middle = getToyTrackPose((cut.from + cut.to) / 2);
    return {
      from: getToyTrackPose(cut.from),
      to: getToyTrackPose(cut.to),
      ridesVisible: middle.normal.y + middle.normal.z > 0,
    };
  });
}
