import { useId } from "react";

import { BoxBevel } from "@/app/laundromat/objects/box-bevel";
import { IsoBox } from "@/app/laundromat/objects/iso-box";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getPillowShape } from "@/lib/laundromat/first-visit/get-pillow-shape";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

const CHANNEL_SPACING = 0.29;
const HEM = {
  wave: 0.42,
  amplitude: 0.025,
  cornerDip: 0.07,
  cornerReach: 0.18,
};
const HEM_SAMPLES = 28;
const FRINGE_GAP = 0.07;
const FRINGE_LENGTH = 0.06;
const STITCH = "[stroke-dasharray:2_2.5]";
const SHEEN = "fill-[var(--lm-ink-hi)] stroke-none opacity-[0.06]";

type BedDrawingProps = {
  bed: BedroomConfig["bed"];
  projection: IsoProjection;
  highlighted: boolean;
  headboardLight: React.ReactNode;
  lampLight: {
    center: { x: number; y: number };
    reach: number;
    fill: string;
    style: React.CSSProperties;
  };
  children?: React.ReactNode;
};

function range(options: { from: number; to: number; step: number }) {
  return Array.from(
    { length: Math.floor((options.to - options.from) / options.step) },
    (_, index) => options.from + (index + 1) * options.step
  );
}

/** Return the height of a draped hem `fromCorner` units along it from the bed's near corner: a soft wave that dips at the corner where the cloth gathers. */
function getHemZ(options: { hemZ: number; fromCorner: number }) {
  const { fromCorner } = options;
  return (
    options.hemZ +
    HEM.amplitude * Math.sin((2 * Math.PI * fromCorner) / HEM.wave) -
    HEM.cornerDip * Math.exp(-fromCorner / HEM.cornerReach)
  );
}

/** Draw the bed far to near: the padded headboard with channel-stitched cushions, `headboardLight` over them, the recessed plinth, the frame, the mattress, two puffy pillows, the channel-quilted duvet draped over the foot and the open side with its folded cuff, and a striped throw with a fringed end; `children` rest on the duvet. Outlines turn `--lm-ink-hi` while `highlighted`. */
export function BedDrawing(props: BedDrawingProps) {
  const id = useId();
  const { bed, projection } = props;
  const { headboard, frame, mattress, duvet } = bed;
  function at(point: IsoPoint) {
    return projectIsoPoint({ point, projection });
  }

  const cushionTop = headboard.size.h - 0.08;
  const cushionY = headboard.position.y + headboard.size.d;
  const cushions = [bed.cushions.left, bed.cushions.right].map((cushion) => ({
    position: { x: cushion.from, y: cushionY, z: bed.cushionBottom },
    size: {
      w: cushion.to - cushion.from,
      d: bed.cushionDepth,
      h: cushionTop - bed.cushionBottom,
    },
    channels: range({
      from: cushion.from,
      to: cushion.to - CHANNEL_SPACING / 2,
      step: CHANNEL_SPACING,
    }),
  }));

  const frameSeamZ = frame.position.z + frame.size.h * 0.45;
  const frameEnd = {
    x: frame.position.x + frame.size.w,
    y: frame.position.y + frame.size.d,
  };
  const mattressTop = mattress.position.z + mattress.size.h;
  const mattressEnd = {
    x: mattress.position.x + mattress.size.w,
    y: mattress.position.y + mattress.size.d,
  };

  const left = mattress.position.x - bed.overhang;
  const right = mattressEnd.x + bed.overhang;
  const head = duvet.position.y;
  const foot = mattressEnd.y + bed.overhang;
  const duvetTop = duvet.position.z + duvet.size.h;
  const cuffEnd = head + bed.cuffDepth;
  const cuffTop = duvetTop + duvet.size.h;

  function sideHem(y: number) {
    return getHemZ({ hemZ: bed.hemZ, fromCorner: foot - y });
  }
  function frontHem(x: number) {
    return getHemZ({ hemZ: bed.hemZ, fromCorner: right - x });
  }
  function samples(from: number, to: number) {
    return Array.from(
      { length: HEM_SAMPLES + 1 },
      (_, index) => from + ((to - from) * index) / HEM_SAMPLES
    );
  }
  const frontDrape = [
    at({ x: left, y: foot, z: duvetTop }),
    at({ x: right, y: foot, z: duvetTop }),
    ...samples(right, left).map((x) => at({ x, y: foot, z: frontHem(x) })),
  ];
  const sideDrape = [
    at({ x: right, y: head, z: duvetTop }),
    at({ x: right, y: foot, z: duvetTop }),
    ...samples(foot, head).map((y) => at({ x: right, y, z: sideHem(y) })),
  ];
  const duvetFaces = getBoxFaces({
    position: { x: left, y: head, z: duvet.position.z },
    size: { w: right - left, d: foot - head, h: duvet.size.h },
    projection,
  });
  const channels = range({
    from: cuffEnd,
    to: foot - bed.channelGap / 2,
    step: bed.channelGap,
  });
  const frontFolds = [0.3, 0.55, 0.8].map(
    (share) => left + (right - left) * share
  );
  const cuff = getBoxFaces({
    position: { x: left, y: head, z: duvetTop },
    size: { w: right - left, d: bed.cuffDepth, h: duvet.size.h },
    projection,
  });
  const cuffStripeY = head + bed.cuffDepth * 0.55;

  const throwBand = bed.throw;
  const throwTop = duvetTop + throwBand.h;
  const throwFar = throwBand.y;
  const throwNear = throwBand.y + throwBand.d;
  const throwRight = right + 0.02;
  const throwFaces = getBoxFaces({
    position: { x: left, y: throwFar, z: duvetTop },
    size: { w: throwRight - left, d: throwBand.d, h: throwBand.h },
    projection,
  });
  const throwDrape = [
    at({ x: throwRight, y: throwFar, z: throwTop }),
    at({ x: throwRight, y: throwNear, z: throwTop }),
    at({ x: throwRight, y: throwNear, z: throwBand.hemZ }),
    at({ x: throwRight, y: throwFar, z: throwBand.hemZ }),
  ];
  const throwStripes = [throwFar + 0.09, throwNear - 0.09];
  const fringe = range({
    from: throwFar,
    to: throwNear - FRINGE_GAP / 2,
    step: FRINGE_GAP,
  });

  const pillows = [bed.pillows.left, bed.pillows.right].map((pillow) =>
    getPillowShape({ ...pillow, puff: bed.pillowPuff, projection })
  );

  const floorPlane = `${getFacePlane({ plane: "top", origin: { x: 0, y: 0, z: 0 }, projection }).transform} scale(${projection.unit})`;
  function lit(options: { key: string; z: number; surface: React.ReactNode }) {
    const { lampLight } = props;
    return (
      <g
        className="pointer-events-none stroke-none"
        clipPath={`url(#${id}-${options.key})`}
        style={lampLight.style}
      >
        <clipPath id={`${id}-${options.key}`}>{options.surface}</clipPath>
        <g
          transform={`translate(0 ${-options.z * projection.unit}) ${floorPlane}`}
        >
          <ellipse
            fill={lampLight.fill}
            cx={lampLight.center.x}
            cy={lampLight.center.y}
            rx={lampLight.reach}
            ry={lampLight.reach}
          />
        </g>
      </g>
    );
  }

  function toneBox(options: {
    position: IsoPoint;
    size: IsoSize;
    front: string;
    side: string;
    top: string;
  }) {
    const faces = getBoxFaces({
      position: options.position,
      size: options.size,
      projection,
    });
    return (
      <g>
        <polygon className={options.front} points={toSvgPoints(faces.front)} />
        <polygon className={options.side} points={toSvgPoints(faces.side)} />
        <polygon className={options.top} points={toSvgPoints(faces.top)} />
      </g>
    );
  }

  return (
    <g
      data-bed
      className={cn(
        "stroke-[var(--lm-line)] transition-[stroke] duration-300",
        props.highlighted && "stroke-[var(--lm-ink-hi)]"
      )}
    >
      <IsoBox
        position={headboard.position}
        size={headboard.size}
        projection={projection}
        bevel={false}
      />
      {cushions.map((cushion) => {
        const front = cushion.position.y + cushion.size.d;
        const top = cushion.position.z + cushion.size.h;
        return (
          <g key={cushion.position.x}>
            <IsoBox
              position={cushion.position}
              size={cushion.size}
              projection={projection}
              bevel={false}
            />
            <g className="fill-none stroke-[var(--lm-detail)]">
              {cushion.channels.map((x) => (
                <polyline
                  key={x}
                  points={toSvgPoints([
                    at({ x, y: front, z: cushion.position.z }),
                    at({ x, y: front, z: top }),
                    at({ x, y: cushion.position.y, z: top }),
                  ])}
                />
              ))}
            </g>
          </g>
        );
      })}
      {props.headboardLight}

      {toneBox({
        position: bed.plinth.position,
        size: bed.plinth.size,
        front: "fill-[var(--lm-recess)]",
        side: "fill-[var(--lm-recess)]",
        top: "fill-[var(--lm-recess)]",
      })}
      <IsoBox
        position={frame.position}
        size={frame.size}
        projection={projection}
      />
      <polyline
        className="fill-none stroke-[var(--lm-detail)]"
        points={toSvgPoints([
          at({ x: frame.position.x, y: frameEnd.y, z: frameSeamZ }),
          at({ x: frameEnd.x, y: frameEnd.y, z: frameSeamZ }),
          at({ x: frameEnd.x, y: frame.position.y, z: frameSeamZ }),
        ])}
      />
      {toneBox({
        position: mattress.position,
        size: mattress.size,
        front: "fill-[var(--lm-face-top)]",
        side: "fill-[var(--lm-shade-2)]",
        top: "fill-[var(--lm-face-top)]",
      })}
      {lit({
        key: "mattress",
        z: mattressTop,
        surface: (
          <polygon
            points={toSvgPoints(
              getBoxFaces({
                position: mattress.position,
                size: mattress.size,
                projection,
              }).top
            )}
          />
        ),
      })}
      <g className="fill-none stroke-[var(--lm-detail)]">
        {[mattressTop - 0.05, mattress.position.z + 0.05].map((z) => (
          <polyline
            key={z}
            points={toSvgPoints([
              at({ x: mattress.position.x, y: mattressEnd.y, z }),
              at({ x: mattressEnd.x, y: mattressEnd.y, z }),
              at({ x: mattressEnd.x, y: mattress.position.y, z }),
            ])}
          />
        ))}
      </g>

      {pillows.map((pillow, index) => (
        <g key={pillow.top}>
          <path className="fill-[var(--lm-shade-2)]" d={pillow.side} />
          <path className="fill-[var(--lm-face)]" d={pillow.front} />
          <path className="fill-[var(--lm-face-top)]" d={pillow.top} />
          <path className={SHEEN} d={pillow.top} />
          {lit({
            key: `pillow-${index}`,
            z: pillow.topZ,
            surface: <path d={pillow.top} />,
          })}
          <path
            className="fill-none stroke-[var(--lm-detail)]"
            d={pillow.seam}
          />
        </g>
      ))}

      <polygon
        className="fill-[var(--lm-wall)]"
        points={toSvgPoints(sideDrape)}
      />
      <polygon
        className="fill-[var(--lm-face)]"
        points={toSvgPoints(frontDrape)}
      />
      <polygon
        className="fill-[var(--lm-face-top)]"
        points={toSvgPoints(duvetFaces.top)}
      />
      <BoxBevel points={duvetFaces.bevel} />
      {lit({
        key: "duvet",
        z: duvetTop,
        surface: <polygon points={toSvgPoints(duvetFaces.top)} />,
      })}
      <g className={cn("fill-none stroke-[var(--lm-detail)]", STITCH)}>
        {channels.map((y) => (
          <polyline
            key={y}
            points={toSvgPoints([
              at({ x: left, y, z: duvetTop }),
              at({ x: right, y, z: duvetTop }),
              at({ x: right, y, z: sideHem(y) }),
            ])}
          />
        ))}
        {frontFolds.map((x) => (
          <polyline
            key={x}
            points={toSvgPoints([
              at({ x, y: cuffEnd, z: duvetTop }),
              at({ x, y: foot, z: duvetTop }),
              at({ x, y: foot, z: frontHem(x) }),
            ])}
          />
        ))}
      </g>
      <polygon
        className="fill-[var(--lm-face)]"
        points={toSvgPoints(cuff.front)}
      />
      <polygon
        className="fill-[var(--lm-shade-2)]"
        points={toSvgPoints(cuff.side)}
      />
      <polygon
        className="fill-[var(--lm-face-top)]"
        points={toSvgPoints(cuff.top)}
      />
      <polygon className={SHEEN} points={toSvgPoints(cuff.top)} />
      {lit({
        key: "cuff",
        z: cuffTop,
        surface: <polygon points={toSvgPoints(cuff.top)} />,
      })}
      <polyline
        className="fill-none stroke-[var(--lm-detail)]"
        points={toSvgPoints([
          at({ x: left, y: cuffStripeY, z: cuffTop }),
          at({ x: right, y: cuffStripeY, z: cuffTop }),
          at({ x: right, y: cuffStripeY, z: duvetTop }),
        ])}
      />

      <polygon
        className="fill-[var(--lm-shade-1)]"
        points={toSvgPoints(throwDrape)}
      />
      <polygon
        className="fill-[var(--lm-shade-1)]"
        points={toSvgPoints(throwFaces.front)}
      />
      <polygon
        className="fill-[var(--lm-shade-2)]"
        points={toSvgPoints(throwFaces.top)}
      />
      {lit({
        key: "throw",
        z: throwTop,
        surface: <polygon points={toSvgPoints(throwFaces.top)} />,
      })}
      <g className="fill-none stroke-[var(--lm-detail)]">
        {throwStripes.map((y) => (
          <polyline
            key={y}
            points={toSvgPoints([
              at({ x: left, y, z: throwTop }),
              at({ x: throwRight, y, z: throwTop }),
              at({ x: throwRight, y, z: throwBand.hemZ }),
            ])}
          />
        ))}
        {fringe.map((y) => (
          <line
            key={y}
            {...(() => {
              const from = at({ x: throwRight, y, z: throwBand.hemZ });
              const to = at({
                x: throwRight,
                y,
                z: throwBand.hemZ - FRINGE_LENGTH,
              });
              return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
            })()}
          />
        ))}
      </g>
      {props.children}
    </g>
  );
}
