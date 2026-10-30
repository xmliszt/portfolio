"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { SavedCat } from "@/lib/paws/cat-api-types";
import type { CatLook } from "@/lib/paws/cat-look";
import { COPY } from "@/lib/paws/copy";
import {
  type MeowOutcome,
  readMeowOutcome,
} from "@/lib/paws/maker/read-meow-outcome";
import {
  type Age,
  AGES,
  MAX_MEOW_TEXT_LENGTH,
  type Mood,
  MOODS,
  type Voice,
  VOICES,
  type VoiceSettings,
} from "@/lib/paws/voice-settings";
import { cn } from "@/lib/utils";

import { fetchSavedCat } from "./fetch-saved-cat";
import { FOCUS_RING_CLASS } from "./focus-ring-class";
import { PENDING_COPY } from "./pending-copy";
import { putCat } from "./put-cat";
import { requestMeow } from "./request-meow";
import { RisoButton } from "./riso-button";
import { SegmentedControl } from "./segmented-control";
import { StudioFrame } from "./studio-frame";
import { TEXT_FIELD_CLASS } from "./text-field-class";

const AGE_OPTIONS = AGES.map((age) => ({
  value: age,
  label: COPY.options.age[age],
}));
const VOICE_OPTIONS = VOICES.map((voice) => ({
  value: voice,
  label: COPY.options.voice[voice],
}));
const MOOD_OPTIONS = MOODS.map((mood) => ({
  value: mood,
  label: COPY.options.mood[mood],
}));

type Phase =
  | { kind: "editing"; notice: string | undefined }
  | { kind: "making" }
  | {
      kind: "ready";
      outcome: Extract<MeowOutcome, { kind: "ready" }>;
      notice: string | undefined;
    }
  | { kind: "bringing"; outcome: Extract<MeowOutcome, { kind: "ready" }> };

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

/** Render the corner card that saves the cat, makes its one sound, plays it back, and brings the cat in. */
export function VoiceStep(props: VoiceStepProps) {
  const textId = useId();
  const formId = useId();
  const [text, setText] = useState("");
  const [playCount, setPlayCount] = useState(0);
  const [phase, setPhase] = useState<Phase>({
    kind: "editing",
    notice: undefined,
  });
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined);
  const controllerRef = useRef(new AbortController());
  const textRef = useRef<HTMLInputElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const bringInId = useId();

  useEffect(() => {
    if (phase.kind === "ready")
      (playRef.current ?? document.getElementById(bringInId))?.focus();
    if (phase.kind === "editing" && phase.notice) textRef.current?.focus();
  }, [phase, bringInId]);

  useEffect(() => {
    const controller = controllerRef.current;
    return () => {
      controller.abort();
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  function readyAudio() {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    return audio;
  }

  function play(meowUrl: string) {
    const audio = readyAudio();
    audio.src = meowUrl;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setPlayCount((count) => count + 1);
  }

  async function makeSound() {
    const signal = controllerRef.current.signal;
    setPhase({ kind: "making" });
    const saved = await putCat({
      accessToken: props.accessToken,
      cat: { look: props.look, voice: props.voice },
      signal,
    });
    if (signal.aborted) return;
    switch (saved.kind) {
      case "saved":
        break;
      case "signInRequired":
        props.onSignInRequired();
        return;
      case "invalid":
      case "unreachable":
        setPhase({ kind: "editing", notice: PENDING_COPY.saveFailed });
        return;
      default: {
        const unhandled: never = saved;
        return unhandled;
      }
    }
    const response = await requestMeow({
      accessToken: props.accessToken,
      meow: {
        text: text.trim() || COPY.voice.textPlaceholder,
        voice: props.voice,
      },
      signal,
    });
    if (signal.aborted) return;
    if (response.kind === "unreachable") {
      setPhase({ kind: "editing", notice: PENDING_COPY.meowUnreachable });
      return;
    }
    const outcome = readMeowOutcome(response);
    switch (outcome.kind) {
      case "ready":
        setPhase({ kind: "ready", outcome, notice: undefined });
        if (outcome.meowUrl) play(outcome.meowUrl);
        return;
      case "tryAnother":
        setPhase({ kind: "editing", notice: outcome.message });
        return;
      case "signInRequired":
        props.onSignInRequired();
        return;
      default: {
        const unhandled: never = outcome;
        return unhandled;
      }
    }
  }

  async function bringCatIn(outcome: Extract<MeowOutcome, { kind: "ready" }>) {
    const signal = controllerRef.current.signal;
    setPhase({ kind: "bringing", outcome });
    const response = await fetchSavedCat({
      accessToken: props.accessToken,
      signal,
    });
    if (signal.aborted) return;
    switch (response.kind) {
      case "found":
        props.onBringCatIn(response.cat);
        return;
      case "signInRequired":
        props.onSignInRequired();
        return;
      case "none":
      case "unreachable":
        setPhase({
          kind: "ready",
          outcome,
          notice: PENDING_COPY.bringInFailed,
        });
        return;
      default: {
        const unhandled: never = response;
        return unhandled;
      }
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    readyAudio();
    void makeSound();
  }

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
  }

  function handleAgeChange(age: Age) {
    props.onVoiceChange({ ...props.voice, age });
  }

  function handleVoiceChange(voice: Voice) {
    props.onVoiceChange({ ...props.voice, voice });
  }

  function handleMoodChange(mood: Mood) {
    props.onVoiceChange({ ...props.voice, mood });
  }

  function handleBringIn() {
    if (phase.kind === "ready") void bringCatIn(phase.outcome);
  }

  function handlePlay() {
    if (
      (phase.kind === "ready" || phase.kind === "bringing") &&
      phase.outcome.meowUrl
    )
      play(phase.outcome.meowUrl);
  }

  const isBusy = phase.kind === "making" || phase.kind === "bringing";
  const isLocked =
    isBusy || (phase.kind === "ready" && !phase.outcome.canTryAgain);
  const notice = (() => {
    switch (phase.kind) {
      case "editing":
        return phase.notice;
      case "ready":
        return phase.notice ?? phase.outcome.message;
      case "making":
      case "bringing":
        return undefined;
      default: {
        const unhandled: never = phase;
        return unhandled;
      }
    }
  })();

  return (
    <StudioFrame
      eyebrow={COPY.voice.eyebrow}
      title={COPY.voice.title}
      look={props.look}
      reactKey={String(playCount)}
      onClose={props.onClose}
      footer={(() => {
        switch (phase.kind) {
          case "editing":
          case "making":
            return (
              <>
                <RisoButton
                  variant="quiet"
                  disabled={isBusy}
                  onClick={props.onBack}
                >
                  {PENDING_COPY.back}
                </RisoButton>
                <RisoButton
                  variant="primary"
                  type="submit"
                  form={formId}
                  disabled={isBusy}
                >
                  {phase.kind === "making"
                    ? COPY.voice.making
                    : COPY.voice.make}
                </RisoButton>
              </>
            );
          case "ready":
          case "bringing":
            return (
              <>
                {phase.outcome.canTryAgain ? (
                  <RisoButton
                    variant="quiet"
                    type="submit"
                    form={formId}
                    disabled={isBusy}
                  >
                    {PENDING_COPY.tryAgain}
                  </RisoButton>
                ) : (
                  <span />
                )}
                <RisoButton
                  variant="primary"
                  id={bringInId}
                  disabled={isBusy}
                  onClick={handleBringIn}
                >
                  {phase.kind === "bringing"
                    ? PENDING_COPY.saving
                    : COPY.voice.bringIn}
                </RisoButton>
              </>
            );
          default: {
            const unhandled: never = phase;
            return unhandled;
          }
        }
      })()}
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-3"
      >
        <div className="flex flex-col gap-y-1">
          <label
            htmlFor={textId}
            className="text-[11px] text-[var(--pw-ink-soft)]"
          >
            {COPY.voice.textLabel}
          </label>
          <input
            ref={textRef}
            id={textId}
            type="text"
            autoFocus
            autoComplete="off"
            maxLength={MAX_MEOW_TEXT_LENGTH}
            placeholder={COPY.voice.textPlaceholder}
            value={text}
            disabled={isLocked}
            onChange={handleTextChange}
            className={TEXT_FIELD_CLASS}
          />
        </div>
        <SegmentedControl
          legend={COPY.voice.age}
          name="age"
          columns={3}
          options={AGE_OPTIONS}
          value={props.voice.age}
          disabled={isLocked}
          onChange={handleAgeChange}
        />
        <SegmentedControl
          legend={COPY.voice.voice}
          name="voice"
          columns={4}
          options={VOICE_OPTIONS}
          value={props.voice.voice}
          disabled={isLocked}
          onChange={handleVoiceChange}
        />
        <SegmentedControl
          legend={COPY.voice.mood}
          name="mood"
          columns={3}
          options={MOOD_OPTIONS}
          value={props.voice.mood}
          disabled={isLocked}
          onChange={handleMoodChange}
        />
        <p className="border-l-[3px] border-[var(--pw-orange)] pl-2 text-[var(--pw-ink-soft)]">
          {COPY.voice.oneOnly}
        </p>
      </form>
      {(phase.kind === "ready" || phase.kind === "bringing") &&
        phase.outcome.meowUrl && (
          <button
            ref={playRef}
            type="button"
            onClick={handlePlay}
            className={cn(
              FOCUS_RING_CLASS,
              "flex h-8 cursor-pointer items-center gap-x-2 self-start border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-blue)] px-3 text-[12px] text-[var(--pw-paper)]"
            )}
          >
            <svg
              aria-hidden
              viewBox="0 0 10 10"
              className="size-2.5"
              fill="currentColor"
            >
              <path d="M2 1l7 4-7 4z" />
            </svg>
            {PENDING_COPY.playSound}
          </button>
        )}
      <p
        role="status"
        aria-live="polite"
        className={cn(notice ? "text-[var(--pw-pink)]" : "sr-only")}
      >
        {notice ?? (phase.kind === "making" ? COPY.voice.making : "")}
      </p>
    </StudioFrame>
  );
}
