import { useEffect, useRef } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { WeatherPanelRects } from "@/lib/laundromat/weather/get-weather-panel-face";
import type { WeatherReading } from "@/lib/laundromat/weather/weather-reading";

import { WeatherPanelFace } from "./objects/weather-panel-face";

export const WEATHER_DIALOG_SIZE_PX = { width: 480, height: 330 };

type WeatherPanelDialogProps = {
  rects: WeatherPanelRects;
  weather: WeatherReading | undefined;
  label: string;
  animated: boolean;
  glyphMotionSeconds: number;
  onClose: () => void;
};

export function WeatherPanelDialog(props: WeatherPanelDialogProps) {
  const { copy } = useLaundromatCopy();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { body } = props.rects;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      data-weather-dialog
      role="dialog"
      aria-label={props.label}
      className="flex flex-col gap-y-3 rounded-[22px] bg-[var(--lm-panel)] p-3.5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_1px_2px_rgb(0_0_0/0.5),0_24px_64px_rgb(0_0_0/0.55)]"
      style={WEATHER_DIALOG_SIZE_PX}
    >
      <svg
        aria-hidden
        viewBox={`-1 -1 ${body.width + 2} ${body.height + 2}`}
        className="min-h-0 w-full flex-1"
      >
        <rect
          {...body}
          rx={3}
          className="fill-[var(--lm-wall)] stroke-[var(--lm-line)]"
          strokeWidth={0.5}
        />
        <WeatherPanelFace
          rects={props.rects}
          weather={props.weather}
          animated={props.animated}
          glyphMotionSeconds={props.glyphMotionSeconds}
        />
      </svg>
      <div className="flex items-center justify-end px-2">
        <button
          ref={closeRef}
          type="button"
          onClick={props.onClose}
          aria-keyshortcuts="Escape"
          title={copy.board.closeHint}
          className="flex h-8 cursor-pointer items-center gap-x-2 rounded-md px-3 text-[13px] text-[var(--lm-ink)] lowercase outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
        >
          {copy.board.close}
          <kbd className="rounded px-1 font-[family-name:var(--lm-font-mono)] text-[10px] leading-4 opacity-70 shadow-[inset_0_0_0_1px_var(--lm-edge)]">
            esc
          </kbd>
        </button>
      </div>
    </div>
  );
}
