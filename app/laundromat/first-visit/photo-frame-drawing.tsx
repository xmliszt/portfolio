import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { IsoBox } from "@/app/laundromat/objects/iso-box";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

const PHOTO_SRC = "/laundromat/room-photo.jpg";
const WIRE_INSET = 0.2;

type PhotoFrameDrawingProps = {
  frame: BedroomConfig["photoFrame"];
  projection: IsoProjection;
};

/** Draw a framed photo of the laundromat hanging from a nail on the back wall, with the photo as an `<img>` on the frame's front face. */
export function PhotoFrameDrawing(props: PhotoFrameDrawingProps) {
  const { copy } = useLaundromatCopy();
  const { frame, projection } = props;
  const { position, size, matInset, photoInset } = frame;
  const { unit } = projection;
  const top = position.z + size.h;
  function at(x: number, z: number) {
    return projectIsoPoint({
      point: { x, y: position.y + size.d / 2, z },
      projection,
    });
  }
  const nail = at(position.x + size.w / 2, top + frame.nailRise);
  const wireEnds = [
    at(position.x + WIRE_INSET, top),
    at(position.x + size.w - WIRE_INSET, top),
  ];
  const front = getFacePlane({
    plane: "front",
    origin: { x: position.x, y: position.y + size.d, z: top },
    projection,
  });
  const matSize = (size.w - matInset * 2) * unit;
  const photoSize = (size.w - photoInset * 2) * unit;

  return (
    <g data-photo-frame>
      <g className="stroke-[var(--lm-detail)]">
        {wireEnds.map((end) => (
          <line key={end.x} x1={nail.x} y1={nail.y} x2={end.x} y2={end.y} />
        ))}
      </g>
      <circle
        className="fill-[var(--lm-detail)] stroke-[var(--lm-line)]"
        cx={nail.x}
        cy={nail.y}
        r={1.6}
      />
      <g className="stroke-[var(--lm-line)]">
        <IsoBox
          position={position}
          size={size}
          projection={projection}
          bevel={false}
        />
      </g>
      <g transform={front.transform}>
        <rect
          className="fill-[var(--lm-face-top)] stroke-[var(--lm-detail)]"
          x={matInset * unit}
          y={matInset * unit}
          width={matSize}
          height={matSize}
        />
        <foreignObject
          x={photoInset * unit}
          y={photoInset * unit}
          width={photoSize}
          height={photoSize}
        >
          {/* A plain <img> so search engines find the photo in the page. */}
          <img
            src={PHOTO_SRC}
            alt={copy.site.title}
            width={1200}
            height={1200}
            decoding="async"
            className="block size-full"
          />
        </foreignObject>
        <rect
          className="fill-none stroke-[var(--lm-line)]"
          x={photoInset * unit}
          y={photoInset * unit}
          width={photoSize}
          height={photoSize}
        />
      </g>
    </g>
  );
}
