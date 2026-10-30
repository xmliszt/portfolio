"use client";

import { useEffect, useId } from "react";

import {
  BELLIES,
  type CatLook,
  COAT_INKS,
  PAD_INKS,
  PATTERNS,
  type Step,
  STEPS,
} from "@/lib/paws/cat-look";
import { COPY } from "@/lib/paws/copy";
import { coatInkOptions } from "@/lib/paws/maker/coat-ink-options";
import { padInkOptions } from "@/lib/paws/maker/pad-ink-options";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";

import { CatPreview } from "./cat-preview";
import { FloatingCard } from "./floating-card";
import { RisoButton } from "./riso-button";
import { SegmentedControl } from "./segmented-control";
import { SwatchPicker } from "./swatch-picker";

const COAT_OPTIONS = coatInkOptions().map((coat) => ({
  value: coat,
  label: COPY.options.coat[coat],
  fill: COAT_INKS[coat],
}));

const PAD_OPTIONS = padInkOptions().map((pads) => ({
  value: pads,
  label: COPY.options.pads[pads],
  fill:
    pads === "mixed"
      ? `linear-gradient(90deg, ${PAD_INKS.pink} 50%, ${PAD_INKS.black} 50%)`
      : PAD_INKS[pads],
}));

const PATTERN_OPTIONS = PATTERNS.map((pattern) => ({
  value: pattern,
  label: COPY.options.pattern[pattern],
}));
const BELLY_OPTIONS = BELLIES.map((belly) => ({
  value: belly,
  label: COPY.options.belly[belly],
}));
const STEP_OPTIONS = STEPS.map((step) => ({
  value: step,
  label: COPY.options.step[step],
}));

const STEP_FIELDS = [
  "size",
  "fluff",
  "tail",
  "ears",
] as const satisfies readonly (keyof CatLook)[];

type CatMakerProps = {
  look: CatLook;
  primaryLabel: string;
  busy: boolean;
  notice: string | undefined;
  onLookChange: (look: CatLook) => void;
  onPrimary: () => void;
  onClose: () => void;
};

/** Render the corner card where a member picks their cat's look over a live preview. */
export function CatMaker(props: CatMakerProps) {
  const primaryId = useId();

  useEffect(() => {
    if (!props.busy && document.activeElement === document.body)
      document.getElementById(primaryId)?.focus();
  }, [props.busy, primaryId]);

  function change(patch: Partial<CatLook>) {
    props.onLookChange({ ...props.look, ...patch });
  }

  function handleCoatChange(coat: CatLook["coat"]) {
    change({ coat });
  }

  function handlePatternChange(pattern: CatLook["pattern"]) {
    change({ pattern });
  }

  function handleBellyChange(belly: CatLook["belly"]) {
    change({ belly });
  }

  function handlePadsChange(pads: CatLook["pads"]) {
    change({ pads });
  }

  function handleShuffle() {
    props.onLookChange(shuffleCatLook({ random: Math.random }));
  }

  return (
    <FloatingCard
      title={COPY.maker.title}
      onClose={props.onClose}
      footer={
        <>
          <RisoButton
            variant="quiet"
            disabled={props.busy}
            onClick={handleShuffle}
          >
            {COPY.maker.shuffle}
          </RisoButton>
          <RisoButton
            variant="primary"
            id={primaryId}
            disabled={props.busy}
            onClick={props.onPrimary}
          >
            {props.primaryLabel}
          </RisoButton>
        </>
      }
    >
      <CatPreview look={props.look} />
      <SwatchPicker
        legend={COPY.maker.coat}
        name="coat"
        options={COAT_OPTIONS}
        value={props.look.coat}
        disabled={props.busy}
        onChange={handleCoatChange}
      />
      <SegmentedControl
        legend={COPY.maker.pattern}
        name="pattern"
        columns={3}
        options={PATTERN_OPTIONS}
        value={props.look.pattern}
        disabled={props.busy}
        onChange={handlePatternChange}
      />
      <SegmentedControl
        legend={COPY.maker.belly}
        name="belly"
        columns={2}
        options={BELLY_OPTIONS}
        value={props.look.belly}
        disabled={props.busy}
        onChange={handleBellyChange}
      />
      <SwatchPicker
        legend={COPY.maker.pads}
        name="pads"
        options={PAD_OPTIONS}
        value={props.look.pads}
        disabled={props.busy}
        onChange={handlePadsChange}
      />
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {STEP_FIELDS.map((field) => (
          <SegmentedControl<Step>
            key={field}
            legend={COPY.maker[field]}
            name={field}
            columns={3}
            options={STEP_OPTIONS}
            value={props.look[field]}
            disabled={props.busy}
            onChange={(step) => change({ [field]: step })}
          />
        ))}
      </div>
      {props.notice && (
        <p role="alert" className="text-[var(--pw-pink)]">
          {props.notice}
        </p>
      )}
    </FloatingCard>
  );
}
