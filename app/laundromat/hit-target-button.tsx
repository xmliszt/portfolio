import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { toClipPath } from "@/lib/laundromat/to-clip-path";

type HitTargetButtonProps = {
  laidOut: LaidOutObject;
  label: string;
  pressed: boolean | undefined;
  onActivate: () => void;
  onPointerShowTooltip: () => void;
  onKeyboardShowTooltip: () => void;
  onHideTooltip: () => void;
};

export function HitTargetButton(props: HitTargetButtonProps) {
  const { bounds, faces } = props.laidOut;
  const clipPath = toClipPath({ outline: faces.outline, bounds });

  function handleFocus(event: React.FocusEvent<HTMLButtonElement>) {
    if (event.currentTarget.matches(":focus-visible")) {
      props.onKeyboardShowTooltip();
    }
  }

  return (
    <button
      type="button"
      data-hit-target={props.laidOut.object.id}
      aria-label={props.label}
      aria-pressed={props.pressed}
      className="absolute cursor-pointer bg-transparent outline-none focus-visible:bg-[var(--lm-shade-1)]/20"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        clipPath,
      }}
      onClick={props.onActivate}
      onPointerEnter={props.onPointerShowTooltip}
      onPointerLeave={props.onHideTooltip}
      onFocus={handleFocus}
      onBlur={props.onHideTooltip}
    />
  );
}
