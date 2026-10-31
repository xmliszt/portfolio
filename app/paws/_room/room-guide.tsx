"use client";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import type { GUIDE_TAKES } from "@/lib/paws/guide/guide-takes";
import { cn } from "@/lib/utils";

import { GuidePreview } from "./guide-preview";
import { RoomSheet } from "./room-sheet";

const MOUSE_ONLY_CLASS = "[@media(pointer:coarse)]:hidden";
const TOUCH_ONLY_CLASS = "hidden [@media(pointer:coarse)]:flex";
const TOUCH_ONLY_ROW_CLASS = "hidden [@media(pointer:coarse)]:contents";
const KEY_CLASS =
  "grid h-5 min-w-5 place-items-center border border-[var(--pw-ink-soft)] px-1 font-[inherit] text-[11px] leading-none text-[var(--pw-ink-soft)]";

type RoomGuideProps = {
  pannable: boolean;
  onClose: () => void;
};

function SectionTitle(props: { dotClass: string; children: React.ReactNode }) {
  return (
    <h3
      className={cn(
        "m-0 flex items-center gap-x-1.5 text-[11px] font-normal tracking-[0.12em] text-[var(--pw-ink-soft)] uppercase before:size-1.5 before:content-[''] [[lang=hi]_&]:tracking-normal",
        props.dotClass
      )}
    >
      {props.children}
    </h3>
  );
}

function PreviewItem(props: {
  take: keyof typeof GUIDE_TAKES;
  posterAt: number;
  act: string;
  result: string;
  className?: string;
}) {
  return (
    <li className={cn("flex flex-col gap-y-2", props.className)}>
      <GuidePreview
        take={props.take}
        posterAt={props.posterAt}
        label={props.act}
      />
      <p className="flex flex-col gap-y-0.5">
        <span className="font-medium">{props.act}</span>
        <span className="text-[var(--pw-ink-soft)]">{props.result}</span>
      </p>
    </li>
  );
}

function KeyRow(props: {
  keys: React.ReactNode;
  text: string;
  className?: string;
}) {
  return (
    <li className={cn("contents", props.className)}>
      <span className="flex items-center gap-x-1 font-medium whitespace-nowrap">
        {props.keys}
      </span>
      <span className="text-[var(--pw-ink-soft)]">{props.text}</span>
    </li>
  );
}

/** Render the how-it-works sheet over the room: what a cursor or finger does to the cats, what happens with other people, what cats do on their own, and the controls for the visitor's pointer, with the look-around rows only while `pannable`. */
export function RoomGuide(props: RoomGuideProps) {
  const { copy } = usePawsCopy();
  const guide = copy.guide;

  return (
    <RoomSheet title={guide.title} onClose={props.onClose}>
      <section className="flex flex-col gap-y-3">
        <SectionTitle dotClass="before:bg-[var(--pw-orange)]">
          {guide.you}
        </SectionTitle>
        <ul className="flex flex-col gap-y-6">
          <PreviewItem
            take="move"
            posterAt={3}
            {...guide.mouse.move}
            className={MOUSE_ONLY_CLASS}
          />
          <PreviewItem
            take="still"
            posterAt={4.5}
            {...guide.mouse.still}
            className={MOUSE_ONLY_CLASS}
          />
          <PreviewItem
            take="press"
            posterAt={3}
            {...guide.mouse.press}
            className={MOUSE_ONLY_CLASS}
          />
          <PreviewItem
            take="wiggle"
            posterAt={3.5}
            {...guide.mouse.wiggle}
            className={MOUSE_ONLY_CLASS}
          />
          <PreviewItem
            take="swipe"
            posterAt={2.6}
            {...guide.mouse.fast}
            className={MOUSE_ONLY_CLASS}
          />
          <PreviewItem
            take="touchHold"
            posterAt={3}
            {...guide.touch.hold}
            className={TOUCH_ONLY_CLASS}
          />
          <PreviewItem
            take="touchSlide"
            posterAt={3.5}
            {...guide.touch.slide}
            className={TOUCH_ONLY_CLASS}
          />
          <PreviewItem
            take="touchSwipe"
            posterAt={2.6}
            {...guide.touch.fast}
            className={TOUCH_ONLY_CLASS}
          />
        </ul>
      </section>

      <section className="flex flex-col gap-y-3">
        <SectionTitle dotClass="before:bg-[var(--pw-pink)]">
          {guide.others}
        </SectionTitle>
        <ul className="flex flex-col gap-y-6">
          <PreviewItem take="everyone" posterAt={4} {...guide.everyone} />
          <PreviewItem take="share" posterAt={3.5} {...guide.share} />
          <PreviewItem take="crowd" posterAt={4.2} {...guide.crowd} />
        </ul>
      </section>

      <section className="flex flex-col gap-y-3">
        <SectionTitle dotClass="before:bg-[var(--pw-blue)]">
          {guide.cats}
        </SectionTitle>
        <GuidePreview take="cats" posterAt={5} label={guide.catsHint} />
        <p className="text-[var(--pw-ink-soft)]">{guide.catsHint}</p>
        <ul className="flex flex-wrap gap-x-1.5 gap-y-1.5">
          {guide.catActs.map((act) => (
            <li
              key={act}
              className="flex h-6 items-center border-[1.5px] border-[var(--pw-rule)] px-2 text-[11px]"
            >
              {act}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-y-3">
        <SectionTitle dotClass="before:bg-[var(--pw-yellow)]">
          {guide.around}
        </SectionTitle>
        <ul className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5">
          {props.pannable && (
            <>
              <KeyRow
                className={MOUSE_ONLY_CLASS}
                keys={
                  <>
                    <kbd className={KEY_CLASS}>←</kbd>
                    <kbd className={KEY_CLASS}>→</kbd>
                    <span className="font-normal text-[var(--pw-ink-soft)]">
                      {guide.or}
                    </span>
                    <kbd className={KEY_CLASS}>A</kbd>
                    <kbd className={KEY_CLASS}>D</kbd>
                  </>
                }
                text={guide.lookAround}
              />
              <KeyRow
                className={TOUCH_ONLY_ROW_CLASS}
                keys={guide.twoFingers}
                text={guide.lookAround}
              />
              <KeyRow keys={guide.dragMap} text={guide.lookAround} />
            </>
          )}
          <KeyRow
            className={MOUSE_ONLY_CLASS}
            keys={<kbd className={KEY_CLASS}>/</kbd>}
            text={guide.talkKey}
          />
          <KeyRow
            className={TOUCH_ONLY_ROW_CLASS}
            keys={guide.tapTalk}
            text={guide.tapTalkResult}
          />
          <KeyRow
            className={MOUSE_ONLY_CLASS}
            keys={<kbd className={KEY_CLASS}>Esc</kbd>}
            text={guide.closeKey}
          />
        </ul>
      </section>
    </RoomSheet>
  );
}
