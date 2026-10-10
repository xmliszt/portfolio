import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { toClipPath } from "@/lib/laundromat/to-clip-path";
import { cn } from "@/lib/utils";

type MachineControlButtonProps = {
  control: LaidOutObject["controls"][number];
  label: string;
  enabled: boolean;
  onPress: () => void;
  onStepBack: () => void;
  onPointerShowTooltip: () => void;
  onKeyboardShowTooltip: () => void;
  onHideTooltip: () => void;
};

const DIAL_FORWARD_KEYS = ["ArrowUp", "ArrowRight"];
const DIAL_BACK_KEYS = ["ArrowDown", "ArrowLeft"];

export function MachineControlButton(props: MachineControlButtonProps) {
  const { bounds, outline } = props.control;
  const isDial = props.control.control === "dial";

  function press(isBack: boolean) {
    if (!props.enabled) return;
    if (isBack) props.onStepBack();
    else props.onPress();
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    press(isDial && event.shiftKey);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement>) {
    if (!isDial) return;
    event.preventDefault();
    press(true);
  }

  function handleWheel(event: React.WheelEvent<HTMLButtonElement>) {
    if (!isDial || event.deltaY === 0) return;
    press(event.deltaY > 0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!isDial) return;
    const isForward = DIAL_FORWARD_KEYS.includes(event.key);
    if (!isForward && !DIAL_BACK_KEYS.includes(event.key)) return;
    event.preventDefault();
    press(!isForward);
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
      onPointerLeave={props.onHideTooltip}
      onFocus={handleFocus}
      onBlur={props.onHideTooltip}
    />
  );
}
