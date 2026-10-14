"use client";

import { useEffect, useRef, useState } from "react";
import { omit } from "lodash";
import { useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useRoomSounds } from "@/app/laundromat/sound/use-room-sounds";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import { ROOM_SOUND_GROUPS } from "@/lib/laundromat/audio/room-sound-groups";
import type { SoundName } from "@/lib/laundromat/audio/sound-names";
import { cn } from "@/lib/utils";

import { RoomSoundRow } from "./room-sound-row";
import { SETTINGS_META_CLASS } from "./settings-meta-class";
import { useRenderQuality } from "./use-render-quality";

const PREVIEW_DELAY_MS = 240;
const ALL_STAGGER_MS = 70;
const STILL_CLICK_VOLUME = 0.6;

const PREVIEWS = {
  machines: ["start-button"],
  "shop-bell": ["shop-bell"],
  unloading: ["door-latch-open", "collect-laundry"],
  coffee: ["coffee-brew-done"],
  tv: ["tv-static"],
  lamp: ["lamp-flicker"],
} satisfies { [group in RoomSoundGroup]: SoundName[] };

/** Let the visitor switch each room sound group on or off with a dial, playing a preview of a group as it turns on, and turn every dial in turn from "all on" / "all off". */
export function RoomSoundsFieldset() {
  const { copy } = useLaundromatCopy();
  const { switches, setSwitches } = useRoomSounds();
  const sound = useSoundBoard();
  const { quality } = useRenderQuality();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isStill = quality === "lite" || prefersReducedMotion;
  const [delaysMs, setDelaysMs] = useState<{
    [group in RoomSoundGroup]?: number;
  }>({});
  const previewTimerRef = useRef<number>(undefined);
  const isAllOn = ROOM_SOUND_GROUPS.every((group) => switches[group]);

  useEffect(() => () => window.clearTimeout(previewTimerRef.current), []);

  function toggle(group: RoomSoundGroup) {
    const next = !switches[group];
    setDelaysMs((current) => omit(current, group));
    setSwitches({ ...switches, [group]: next });
    window.clearTimeout(previewTimerRef.current);
    if (isStill) sound?.play("knob-click", { volume: STILL_CLICK_VOLUME });
    if (!next) return;
    previewTimerRef.current = window.setTimeout(
      () => PREVIEWS[group].forEach((name) => sound?.play(name)),
      PREVIEW_DELAY_MS
    );
  }

  function setAll(on: boolean) {
    window.clearTimeout(previewTimerRef.current);
    if (isStill) sound?.play("knob-click", { volume: STILL_CLICK_VOLUME });
    const changing = ROOM_SOUND_GROUPS.filter(
      (group) => switches[group] !== on
    );
    setDelaysMs(
      Object.fromEntries(
        changing.map((group, index) => [group, index * ALL_STAGGER_MS])
      )
    );
    setSwitches({
      machines: on,
      "shop-bell": on,
      unloading: on,
      coffee: on,
      tv: on,
      lamp: on,
    });
  }

  return (
    <fieldset className="m-0 flex flex-col gap-y-3 border-0 p-0">
      <legend className="sr-only">{copy.settings.roomSounds}</legend>
      <div className="flex items-baseline justify-between">
        <span aria-hidden className={cn(SETTINGS_META_CLASS, "opacity-60")}>
          {copy.settings.roomSounds}
        </span>
        <button
          type="button"
          onClick={() => setAll(!isAllOn)}
          className={cn(
            SETTINGS_META_CLASS,
            "cursor-pointer underline decoration-[var(--lm-line)] underline-offset-[3px] outline-none hover:text-[var(--lm-ink-hi)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
          )}
        >
          {isAllOn
            ? copy.settings.roomSoundsAllOff
            : copy.settings.roomSoundsAllOn}
        </button>
      </div>
      <div className="@container flex flex-col gap-y-0.5">
        {ROOM_SOUND_GROUPS.map((group) => (
          <RoomSoundRow
            key={group}
            group={group}
            label={copy.settings.roomSound[group].label}
            hint={copy.settings.roomSound[group].hint}
            offLabel={copy.settings.roomSoundOff}
            onLabel={copy.settings.roomSoundOn}
            on={switches[group]}
            still={isStill}
            delayMs={delaysMs[group] ?? 0}
            onToggle={() => toggle(group)}
          />
        ))}
      </div>
      <p className="m-0 font-[family-name:var(--lm-font-display)] text-[13px] leading-5 text-pretty opacity-60">
        {copy.settings.roomSoundsHint}
      </p>
    </fieldset>
  );
}
