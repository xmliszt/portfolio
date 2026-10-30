"use client";

import { useEffect, useRef, useState } from "react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { useUiSound } from "@/app/paws/_room/use-ui-sound";
import type { SavedCat } from "@/lib/paws/cat-api-types";
import type { CatLook } from "@/lib/paws/cat-look";
import { getMeowUrl } from "@/lib/paws/sound/get-meow-url";
import {
  type Age,
  AGES,
  type Mood,
  MOODS,
  type Voice,
  VOICES,
  type VoiceSettings,
} from "@/lib/paws/voice-settings";
import { cn } from "@/lib/utils";

import { putCat } from "./put-cat";
import { RisoButton } from "./riso-button";
import { SegmentedControl } from "./segmented-control";
import { StudioFrame } from "./studio-frame";

type Phase =
  | { kind: "editing"; notice: string | undefined }
  | { kind: "bringing" };

type VoiceStepProps = {
  accessToken: string;
  look: CatLook;
  voice: VoiceSettings;
  onVoiceChange: (voice: VoiceSettings) => void;
  onBack: () => void;
  onSignInRequired: () => void;
  onBringCatIn: (cat: SavedCat) => void;
  onClose: () => void;
};

/** Render the corner card where a member tunes their cat's meow, hearing it on every change, then saves the cat and brings it in. */
export function VoiceStep(props: VoiceStepProps) {
  const playUi = useUiSound();
  const { copy } = usePawsCopy();
  const AGE_OPTIONS = AGES.map((age) => ({
    value: age,
    label: copy.options.age[age],
  }));
  const VOICE_OPTIONS = VOICES.map((voice) => ({
    value: voice,
    label: copy.options.voice[voice],
  }));
  const MOOD_OPTIONS = MOODS.map((mood) => ({
    value: mood,
    label: copy.options.mood[mood],
  }));
  const [playCount, setPlayCount] = useState(0);
  const [phase, setPhase] = useState<Phase>({
    kind: "editing",
    notice: undefined,
  });
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined);
  const controllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    return () => {
      controller.abort();
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  function play(voice: VoiceSettings) {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = getMeowUrl(voice);
    audio.currentTime = 0;
    audio
      .play()
      .then(() => setPlayCount((count) => count + 1))
      .catch(() => undefined);
  }

  function tune(voice: VoiceSettings) {
    props.onVoiceChange(voice);
    play(voice);
  }

  async function bringCatIn() {
    const signal = controllerRef.current.signal;
    setPhase({ kind: "bringing" });
    const saved = await putCat({
      accessToken: props.accessToken,
      cat: { look: props.look, voice: props.voice },
      signal,
    });
    if (signal.aborted) return;
    switch (saved.kind) {
      case "saved":
        props.onBringCatIn(saved.cat);
        return;
      case "signInRequired":
        props.onSignInRequired();
        return;
      case "invalid":
      case "unreachable":
        playUi("refused");
        setPhase({ kind: "editing", notice: copy.maker.saveFailed });
        return;
      default: {
        const unhandled: never = saved;
        return unhandled;
      }
    }
  }

  function handleAgeChange(age: Age) {
    tune({ ...props.voice, age });
  }

  function handleVoiceChange(voice: Voice) {
    tune({ ...props.voice, voice });
  }

  function handleMoodChange(mood: Mood) {
    tune({ ...props.voice, mood });
  }

  function handlePlay() {
    play(props.voice);
  }

  function handleBringIn() {
    void bringCatIn();
  }

  const isBusy = phase.kind === "bringing";
  const notice = phase.kind === "editing" ? phase.notice : undefined;

  return (
    <StudioFrame
      eyebrow={copy.voice.eyebrow}
      title={copy.voice.title}
      look={props.look}
      reactKey={String(playCount)}
      fixedHeight={false}
      onClose={props.onClose}
      footer={
        <>
          <RisoButton variant="quiet" disabled={isBusy} onClick={props.onBack}>
            {copy.common.back}
          </RisoButton>
          <RisoButton
            variant="primary"
            disabled={isBusy}
            onClick={handleBringIn}
          >
            {isBusy ? copy.voice.bringing : copy.voice.bringIn}
          </RisoButton>
        </>
      }
    >
      <div className="flex flex-col gap-y-3">
        <SegmentedControl
          legend={copy.voice.age}
          name="age"
          columns={3}
          options={AGE_OPTIONS}
          value={props.voice.age}
          disabled={isBusy}
          onChange={handleAgeChange}
        />
        <SegmentedControl
          legend={copy.voice.voice}
          name="voice"
          columns={4}
          options={VOICE_OPTIONS}
          value={props.voice.voice}
          disabled={isBusy}
          onChange={handleVoiceChange}
        />
        <SegmentedControl
          legend={copy.voice.mood}
          name="mood"
          columns={3}
          options={MOOD_OPTIONS}
          value={props.voice.mood}
          disabled={isBusy}
          onChange={handleMoodChange}
        />
      </div>
      <div className="self-start">
        <RisoButton variant="quiet" disabled={isBusy} onClick={handlePlay}>
          <span className="flex items-center gap-x-2">
            <svg
              aria-hidden
              viewBox="0 0 10 10"
              className="size-2.5"
              fill="currentColor"
            >
              <path d="M2 1l7 4-7 4z" />
            </svg>
            {copy.voice.play}
          </span>
        </RisoButton>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={cn(
          notice ? "border-l-[3px] border-[var(--pw-pink)] pl-2" : "sr-only"
        )}
      >
        {notice ?? ""}
      </p>
    </StudioFrame>
  );
}
