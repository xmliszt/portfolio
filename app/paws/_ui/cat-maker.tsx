"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { useUiSound } from "@/app/paws/_room/use-ui-sound";
import {
  BELLIES,
  type CatLook,
  COAT_INKS,
  PAD_INKS,
  PATTERNS,
  type Step,
  STEPS,
} from "@/lib/paws/cat-look";
import { coatInkOptions } from "@/lib/paws/maker/coat-ink-options";
import { padInkOptions } from "@/lib/paws/maker/pad-ink-options";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { cn } from "@/lib/utils";

import { FOCUS_RING_CLASS } from "./focus-ring-class";
import { RisoButton } from "./riso-button";
import { SegmentedControl } from "./segmented-control";
import { StudioFrame } from "./studio-frame";
import { SwatchPicker } from "./swatch-picker";

const SHUFFLE_ROLLS = 6;
const SHUFFLE_ROLL_MS = 70;

const TABS = ["coat", "pattern", "belly", "pads", "shape"] as const;
const SHAPE_FIELDS = [
  "size",
  "fluff",
  "tail",
  "ears",
] as const satisfies readonly (keyof CatLook)[];

type Tab = (typeof TABS)[number];

type CatMakerProps = {
  look: CatLook;
  onLookChange: (look: CatLook) => void;
  onPrimary: () => void;
  onClose: () => void;
};

/** Render the studio where a member picks their cat's look one group at a time while the cat, large in the middle, reacts to every change. */
export function CatMaker(props: CatMakerProps) {
  const playUi = useUiSound();
  const { copy } = usePawsCopy();
  const COAT_OPTIONS = coatInkOptions().map((coat) => ({
    value: coat,
    label: copy.options.coat[coat],
    fill: COAT_INKS[coat],
  }));

  const PAD_OPTIONS = padInkOptions().map((pads) => ({
    value: pads,
    label: copy.options.pads[pads],
    fill:
      pads === "mixed"
        ? `linear-gradient(90deg, ${PAD_INKS.pink} 50%, ${PAD_INKS.black} 50%)`
        : PAD_INKS[pads],
  }));

  const PATTERN_OPTIONS = PATTERNS.map((pattern) => ({
    value: pattern,
    label: copy.options.pattern[pattern],
  }));
  const BELLY_OPTIONS = BELLIES.map((belly) => ({
    value: belly,
    label: copy.options.belly[belly],
  }));
  const STEP_OPTIONS = STEPS.map((step) => ({
    value: step,
    label: copy.options.step[step],
  }));
  const [tab, setTab] = useState<Tab>("coat");
  const tabsId = useId();
  const primaryId = useId();
  const rollRef = useRef<number | undefined>(undefined);
  const isReduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (document.activeElement === document.body)
      document.getElementById(primaryId)?.focus();
  }, [primaryId]);

  useEffect(() => () => window.clearInterval(rollRef.current), []);

  function change(patch: Partial<CatLook>) {
    playUi("optionPick");
    props.onLookChange({ ...props.look, ...patch });
  }

  function handleShuffle() {
    playUi("shuffle");
    window.clearInterval(rollRef.current);
    if (isReduced) {
      props.onLookChange(shuffleCatLook({ random: Math.random }));
      return;
    }
    const roll = { count: 0 };
    rollRef.current = window.setInterval(() => {
      roll.count += 1;
      props.onLookChange(shuffleCatLook({ random: Math.random }));
      if (roll.count >= SHUFFLE_ROLLS) window.clearInterval(rollRef.current);
    }, SHUFFLE_ROLL_MS);
  }

  function handleTabKeyDown(event: React.KeyboardEvent) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = TABS.at((TABS.indexOf(tab) + step) % TABS.length) ?? "coat";
    setTab(next);
    document.getElementById(`${tabsId}-${next}`)?.focus();
  }

  return (
    <StudioFrame
      eyebrow={copy.maker.eyebrow}
      title={copy.maker.title}
      look={props.look}
      reactKey={JSON.stringify(props.look)}
      fixedHeight
      toolbar={
        <div className="flex items-center gap-x-3">
          <div
            role="tablist"
            aria-label={copy.maker.title}
            onKeyDown={handleTabKeyDown}
            className="flex min-w-0 gap-x-4 overflow-x-auto"
          >
            {TABS.map((name) => {
              const isActive = name === tab;
              return (
                <button
                  key={name}
                  id={`${tabsId}-${name}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tabsId}-panel`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setTab(name)}
                  className={cn(
                    FOCUS_RING_CLASS,
                    "shrink-0 cursor-pointer border-b-[1.5px] py-2.5 text-[12px] leading-none sm:py-1",
                    isActive
                      ? "border-[var(--pw-orange)] text-[var(--pw-ink)]"
                      : "border-transparent text-[var(--pw-ink-soft)] hover:text-[var(--pw-ink)]"
                  )}
                >
                  {copy.maker.tabs[name]}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleShuffle}
            className={cn(
              FOCUS_RING_CLASS,
              "ml-auto shrink-0 cursor-pointer py-2.5 text-[12px] leading-none underline underline-offset-2 disabled:opacity-50 sm:py-1"
            )}
          >
            {copy.maker.shuffle}
          </button>
        </div>
      }
      onClose={props.onClose}
      footer={
        <RisoButton variant="primary" id={primaryId} onClick={props.onPrimary}>
          {copy.maker.next}
        </RisoButton>
      }
    >
      <div
        id={`${tabsId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-${tab}`}
        className="min-h-[64px]"
      >
        {(() => {
          switch (tab) {
            case "coat":
              return (
                <SwatchPicker
                  legend={copy.maker.coat}
                  name="coat"
                  options={COAT_OPTIONS}
                  value={props.look.coat}
                  onChange={(coat) => change({ coat })}
                />
              );
            case "pattern":
              return (
                <SegmentedControl
                  legend={copy.maker.pattern}
                  name="pattern"
                  columns={3}
                  options={PATTERN_OPTIONS}
                  value={props.look.pattern}
                  onChange={(pattern) => change({ pattern })}
                />
              );
            case "belly":
              return (
                <SegmentedControl
                  legend={copy.maker.belly}
                  name="belly"
                  columns={BELLY_OPTIONS.length}
                  options={BELLY_OPTIONS}
                  value={props.look.belly}
                  onChange={(belly) => change({ belly })}
                />
              );
            case "pads":
              return (
                <SwatchPicker
                  legend={copy.maker.pads}
                  name="pads"
                  options={PAD_OPTIONS}
                  value={props.look.pads}
                  onChange={(pads) => change({ pads })}
                />
              );
            case "shape":
              return (
                <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                  {SHAPE_FIELDS.map((field) => (
                    <SegmentedControl<Step>
                      key={field}
                      legend={copy.maker[field]}
                      name={field}
                      columns={3}
                      options={STEP_OPTIONS}
                      value={props.look[field]}
                      onChange={(step) => change({ [field]: step })}
                    />
                  ))}
                </div>
              );
            default: {
              const unhandled: never = tab;
              return unhandled;
            }
          }
        })()}
      </div>
    </StudioFrame>
  );
}
