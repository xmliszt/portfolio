import type { ScreenBounds } from "@/lib/laundromat/build-scene-layout";
import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { toClipPath } from "@/lib/laundromat/to-clip-path";

type ShelfBookButtonProps = {
  id: string;
  outline: ScreenPoint[];
  bounds: ScreenBounds;
  label: string;
  onActivate: () => void;
  onPointerShowTooltip: () => void;
  onKeyboardShowTooltip: () => void;
  onHideTooltip: () => void;
};

export function ShelfBookButton(props: ShelfBookButtonProps) {
  const { bounds } = props;

  function handleFocus(event: React.FocusEvent<HTMLButtonElement>) {
    if (event.currentTarget.matches(":focus-visible")) {
      props.onKeyboardShowTooltip();
    }
  }

  return (
    <button
      type="button"
      data-hit-target={props.id}
      aria-label={props.label}
      className="absolute cursor-pointer bg-transparent outline-none"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        clipPath: toClipPath({ outline: props.outline, bounds }),
      }}
      onClick={props.onActivate}
      onPointerEnter={props.onPointerShowTooltip}
      onPointerLeave={props.onHideTooltip}
      onFocus={handleFocus}
      onBlur={props.onHideTooltip}
    />
  );
}
