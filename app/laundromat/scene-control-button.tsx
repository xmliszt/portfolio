import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { toClipPath } from "@/lib/laundromat/to-clip-path";
import { cn } from "@/lib/utils";

type SceneControlButtonProps = {
  control: LaidOutObject["controls"][number];
  knob: boolean;
  label: string;
  enabled: boolean;
  onPress: () => void;
  onStepBack: () => void;
  onPointerShowTooltip: () => void;
  onKeyboardShowTooltip: () => void;
  onHideTooltip: () => void;
  onTouchLeave: () => void;
};

const KNOB_FORWARD_KEYS = ["ArrowUp", "ArrowRight"];
const KNOB_BACK_KEYS = ["ArrowDown", "ArrowLeft"];

export function SceneControlButton(props: SceneControlButtonProps) {
  const { bounds, outline } = props.control;

  function press(isBack: boolean) {
    if (!props.enabled) return;
    if (isBack) props.onStepBack();
    else props.onPress();
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    press(props.knob && event.shiftKey);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement>) {
    if (!props.knob) return;
    event.preventDefault();
    press(true);
  }

  function handleWheel(event: React.WheelEvent<HTMLButtonElement>) {
    if (!props.knob || event.deltaY === 0) return;
    press(event.deltaY > 0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!props.knob) return;
    const isForward = KNOB_FORWARD_KEYS.includes(event.key);
    if (!isForward && !KNOB_BACK_KEYS.includes(event.key)) return;
    event.preventDefault();
    press(!isForward);
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLButtonElement>) {
    if (props.knob && event.pointerType === "touch") props.onTouchLeave();
    else props.onHideTooltip();
  }

  function handleFocus(event: React.FocusEvent<HTMLButtonElement>) {
    if (event.currentTarget.matches(":focus-visible")) {
      props.onKeyboardShowTooltip();
    }
  }

  return (
    <button
      type="button"
      data-hit-target={props.control.id}
      aria-label={props.label}
      aria-disabled={!props.enabled}
      className={cn(
        "absolute bg-transparent outline-none",
        props.enabled ? "cursor-pointer" : "cursor-default"
      )}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        clipPath: toClipPath({ outline, bounds }),
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onPointerEnter={props.onPointerShowTooltip}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={props.onHideTooltip}
    />
  );
}
