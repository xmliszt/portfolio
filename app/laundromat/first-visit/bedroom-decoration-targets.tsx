import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneDecoration } from "@/lib/laundromat/scene-config";
import { toClipPath } from "@/lib/laundromat/to-clip-path";

type BedroomDecorationTargetsProps = {
  decorations: SceneDecoration[];
  projection: IsoProjection;
  onActivate: (_object: {
    id: string;
    kind: "pumpkin" | "ghost" | "skeleton";
  }) => void;
};

export function BedroomDecorationTargets(props: BedroomDecorationTargetsProps) {
  const { copy } = useLaundromatCopy();
  return props.decorations.map((object) => {
    if (object.kind === "cobweb") return undefined;
    const faces = getBoxFaces({
      position: object.position,
      size: object.size,
      projection: props.projection,
    });
    const x = Math.min(...faces.outline.map((point) => point.x));
    const y = Math.min(...faces.outline.map((point) => point.y));
    const bounds = {
      x,
      y,
      width: Math.max(...faces.outline.map((point) => point.x)) - x,
      height: Math.max(...faces.outline.map((point) => point.y)) - y,
    };
    return (
      <button
        key={object.id}
        type="button"
        data-hit-target={object.id}
        aria-label={copy.decorations[object.kind].label}
        className="absolute cursor-pointer bg-transparent outline-none focus-visible:bg-[var(--lm-shade-1)]/20"
        style={{
          left: x,
          top: y,
          width: bounds.width,
          height: bounds.height,
          clipPath: toClipPath({ outline: faces.outline, bounds }),
        }}
        onClick={() => props.onActivate(object)}
      />
    );
  });
}
