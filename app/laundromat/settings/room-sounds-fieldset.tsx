"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { omit } from "lodash";
import { useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useRoomSounds } from "@/app/laundromat/sound/use-room-sounds";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { useSoundMuted } from "@/app/laundromat/sound/use-sound-muted";
import { createRoomMix } from "@/lib/laundromat/audio/create-room-mix";
import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import {
  ROOM_SOUND_GROUPS,
  ROOM_SOUND_VOLUME,
} from "@/lib/laundromat/audio/room-sound-groups";
import type { SoundName } from "@/lib/laundromat/audio/sound-names";
import { cn } from "@/lib/utils";

import { RoomMixDeck } from "./room-mix-deck";
import { RoomSoundRow } from "./room-sound-row";
import { SETTINGS_META_CLASS } from "./settings-meta-class";
import { useRenderQuality } from "./use-render-quality";

const PREVIEW_DELAY_MS = 240;
const ALL_STAGGER_MS = 70;
const STILL_CLICK_VOLUME = 0.6;
const LIVE_AMPLITUDE_GAIN = 3.2;

const PREVIEWS = {
  machines: ["start-button"],
  "shop-bell": ["shop-bell"],
  unloading: ["door-latch-open", "collect-laundry"],
  coffee: ["coffee-brew-done"],
  tv: ["tv-static"],
  lamp: ["lamp-flicker"],
  weather: ["thunder-rumble"],
} satisfies { [group in RoomSoundGroup]: SoundName[] };

/** Let the visitor switch each room sound group on or off with a dial and set its volume with a fader, hear one group alone while adjusting its fader or every group together from the room mix player, play a preview of a group as it turns on, and turn every dial in turn from "all on" / "all off". */
export function RoomSoundsFieldset() {
  const { copy } = useLaundromatCopy();
  const { switches, setSwitches, volumes, setVolumes } = useRoomSounds();
  const { muted, setMuted } = useSoundMuted();
  const sound = useSoundBoard();
  const { quality } = useRenderQuality();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isStill = quality === "lite" || prefersReducedMotion;
  const [delaysMs, setDelaysMs] = useState<{
    [group in RoomSoundGroup]?: number;
  }>({});
  const [isMixing, setIsMixing] = useState(false);
  const [soloGroups, setSoloGroups] = useState<{
    [group in RoomSoundGroup]?: true;
  }>({});
  const previewTimerRef = useRef<number>(undefined);
  const isMixingRef = useRef(false);
  const isAllOn = ROOM_SOUND_GROUPS.every((group) => switches[group]);
  const mix = useMemo(
    () => (sound === undefined ? undefined : createRoomMix({ board: sound })),
    [sound]
  );

  useEffect(() => () => window.clearTimeout(previewTimerRef.current), []);
  useEffect(() => () => mix?.dispose(), [mix]);

  function getLiveAmplitude(group: RoomSoundGroup) {
    if (sound === undefined || mix?.isHeard(group) !== true) return undefined;
    return Math.min(
      ROOM_SOUND_VOLUME.max,
      Math.sqrt(sound.getLevel(group)) * LIVE_AMPLITUDE_GAIN
    );
  }

  function toggle(group: RoomSoundGroup) {
    const next = !switches[group];
    setDelaysMs((current) => omit(current, group));
    setSwitches({ ...switches, [group]: next });
    window.clearTimeout(previewTimerRef.current);
    if (isStill) sound?.play("knob-click", { volume: STILL_CLICK_VOLUME });
    if (!next || isMixing) return;
    previewTimerRef.current = window.setTimeout(
      () => PREVIEWS[group].forEach((name) => sound?.play(name, { group })),
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
      weather: on,
    });
  }

  function changeVolume(group: RoomSoundGroup, volume: number) {
    setDelaysMs((current) => omit(current, group));
    setVolumes({ ...volumes, [group]: volume });
  }

  function startAdjusting(group: RoomSoundGroup) {
    window.clearTimeout(previewTimerRef.current);
    if (!switches[group]) {
      setDelaysMs((current) => omit(current, group));
      setSwitches({ ...switches, [group]: true });
    }
    setSoloGroups((current) => ({ ...current, [group]: true }));
    mix?.startSolo(group);
  }

  function stopAdjusting(group: RoomSoundGroup) {
    setSoloGroups((current) => omit(current, group));
    mix?.endSolo(group);
  }

  function toggleMix() {
    if (mix === undefined) return;
    if (isMixing) {
      isMixingRef.current = false;
      mix.stopMix();
      setIsMixing(false);
      return;
    }
    window.clearTimeout(previewTimerRef.current);
    if (muted) setMuted(false);
    isMixingRef.current = true;
    setIsMixing(true);
    void sound?.resume().then(() => {
      if (isMixingRef.current) mix.startMix();
    });
  }

  return (
    <fieldset className="m-0 flex flex-col gap-y-3 border-0 p-0">
      <legend className="sr-only">{copy.settings.roomSounds}</legend>
      <div className="flex items-baseline justify-between">
        <span aria-hidden className={cn(SETTINGS_META_CLASS, "opacity-80")}>
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
      <RoomMixDeck
        playing={isMixing}
        still={isStill}
        label={copy.settings.roomMix.play}
        playingLabel={copy.settings.roomMix.playing}
        playLabel={copy.settings.roomMix.playLabel}
        stopLabel={copy.settings.roomMix.stopLabel}
        getLevel={() => sound?.getLevel() ?? 0}
        onToggle={toggleMix}
      />
      <div className="@container flex flex-col gap-y-0.5">
        {ROOM_SOUND_GROUPS.map((group) => (
          <RoomSoundRow
            key={group}
            group={group}
            label={copy.settings.roomSound[group].label}
            hint={copy.settings.roomSound[group].hint}
            offLabel={copy.settings.roomSoundOff}
            onLabel={copy.settings.roomSoundOn}
            volumeLabel={copy.settings.roomSoundVolume({
              sound: copy.settings.roomSound[group].label,
            })}
            on={switches[group]}
            volume={volumes[group]}
            live={switches[group] && (isMixing || soloGroups[group] === true)}
            still={isStill}
            delayMs={delaysMs[group] ?? 0}
            getLiveAmplitude={() =>
              switches[group] ? getLiveAmplitude(group) : undefined
            }
            onToggle={() => toggle(group)}
            onVolumeChange={(volume) => changeVolume(group, volume)}
            onAdjustStart={() => startAdjusting(group)}
            onAdjustEnd={() => stopAdjusting(group)}
          />
        ))}
      </div>
      <p className="m-0 font-[family-name:var(--lm-font-display)] text-[13px] leading-5 text-pretty opacity-80">
        {copy.settings.roomSoundsHint}
      </p>
    </fieldset>
  );
}
