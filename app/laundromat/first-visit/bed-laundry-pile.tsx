import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const PILE_SIZE = { w: 0.72, d: 0.56 };
const LAYER_HEIGHT = 0.09;
const LAYERS = [
  { fill: "fill-[var(--lm-face-top)]", offset: { x: 0, y: 0 } },
  { fill: "fill-[var(--lm-detail)]", offset: { x: 0.04, y: -0.03 } },
  { fill: "fill-[var(--lm-face-top)]", offset: { x: -0.03, y: 0.03 } },
  { fill: "fill-[var(--lm-face)]", offset: { x: 0.02, y: 0.01 } },
];

type BedLaundryPileProps = {
  bed: BedroomConfig["bed"];
  projection: IsoProjection;
};

/** Draw a neat stack of folded clean laundry resting on the bed's duvet, behind the throw. */
export function BedLaundryPile(props: BedLaundryPileProps) {
  const { duvet } = props.bed;
  const top = duvet.position.z + duvet.size.h;
  const corner = {
    x: duvet.position.x + duvet.size.w * 0.42,
    y: props.bed.throw.y - PILE_SIZE.d - 0.08,
  };
  return (
    <g data-bed-laundry-pile className="stroke-[var(--lm-line)]">
      {LAYERS.map((layer, index) => {
        const faces = getBoxFaces({
          position: {
            x: corner.x + layer.offset.x,
            y: corner.y + layer.offset.y,
            z: top + index * LAYER_HEIGHT,
          },
          size: { ...PILE_SIZE, h: LAYER_HEIGHT },
          projection: props.projection,
        });
        const [backLeft, backRight, frontRight, frontLeft] = faces.top;
        return (
          <g key={index}>
            <polygon
              className="fill-[var(--lm-face)]"
              points={toSvgPoints(faces.front)}
            />
            <polygon
              className="fill-[var(--lm-wall)]"
              points={toSvgPoints(faces.side)}
            />
            <polygon className={layer.fill} points={toSvgPoints(faces.top)} />
            <line
              x1={(backLeft.x + frontLeft.x) / 2}
              y1={(backLeft.y + frontLeft.y) / 2}
              x2={(backRight.x + frontRight.x) / 2}
              y2={(backRight.y + frontRight.y) / 2}
              className="stroke-[var(--lm-detail)]"
            />
          </g>
        );
      })}
    </g>
  );
}
