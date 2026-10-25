"use client";

import { useEffect, useId } from "react";
import { useReducedMotion, useSpring } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { RotarySwitchDial } from "@/app/laundromat/rotary-switch-dial";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";

const DIAL_SPRING = { visualDuration: 0.38, bounce: 0.28 };

type SeasonalSwitchProps = { on: boolean; onToggle: () => void };

export function SeasonalSwitch(props: SeasonalSwitchProps) {
  const { copy } = useLaundromatCopy();
  const sound = useSoundBoard();
  const labelId = useId();
  const hintId = useId();
  const turn = useSpring(props.on ? 1 : 0, DIAL_SPRING);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) turn.jump(props.on ? 1 : 0);
    else turn.set(props.on ? 1 : 0);
    return () => turn.stop();
  }, [props.on, reducedMotion, turn]);

  function toggle() {
    sound?.play("knob-click", { volume: 0.6 });
    props.onToggle();
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.on}
      aria-labelledby={labelId}
      aria-describedby={hintId}
      onClick={toggle}
      className="group grid min-h-[76px] w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-xl bg-[linear-gradient(180deg,var(--lm-housing-top),var(--lm-housing-bottom))] px-3 py-3 text-left lowercase shadow-[inset_0_0_0_1px_var(--lm-control-edge),inset_0_1px_0_rgb(255_255_255/0.08),0_1px_0_rgb(255_255_255/0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--lm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lm-panel)]"
    >
      <span className="flex min-w-0 flex-col gap-y-1">
        <span id={labelId} className="text-[12px] text-[var(--lm-ink-hi)]">
          {copy.themes.seasonal}
        </span>
        <span id={hintId} className="text-[10px] leading-4 opacity-80">
          {props.on ? copy.themes.seasonalOn : copy.themes.seasonalOff}
        </span>
      </span>
      <RotarySwitchDial
        turn={turn}
        on={props.on}
        offLabel={copy.settings.roomSoundOff}
        onLabel={copy.settings.roomSoundOn}
      />
    </button>
  );
}
