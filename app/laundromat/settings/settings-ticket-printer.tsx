"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import { useRoomSounds } from "@/app/laundromat/sound/use-room-sounds";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { useSoundMuted } from "@/app/laundromat/sound/use-sound-muted";
import type {
  RoomSoundSwitches,
  RoomSoundVolumes,
} from "@/lib/laundromat/audio/room-sound-groups";
import type { RenderQualityPreference } from "@/lib/laundromat/render-quality/render-quality";
import { buildSettingsTicket } from "@/lib/laundromat/settings-ticket/build-settings-ticket";
import { decodeSettingsTicket } from "@/lib/laundromat/settings-ticket/decode-settings-ticket";
import { encodeSettingsTicket } from "@/lib/laundromat/settings-ticket/encode-settings-ticket";
import { encodeSettingsTicketCode } from "@/lib/laundromat/settings-ticket/encode-settings-ticket-code";
import { getSettingsTicketUrl } from "@/lib/laundromat/settings-ticket/get-settings-ticket-url";
import { getTicketNumber } from "@/lib/laundromat/settings-ticket/get-ticket-number";
import { readSettingsTicket } from "@/lib/laundromat/settings-ticket/read-settings-ticket";
import type { SettingsTicketTv } from "@/lib/laundromat/settings-ticket/settings-ticket";
import { SETTINGS_TICKET_FILE_EXTENSION } from "@/lib/laundromat/settings-ticket/settings-ticket";
import { TV_STATION_IDS } from "@/lib/laundromat/tv/tv-state";
import {
  TV_RESTORED_EVENT,
  TV_STORAGE_KEYS,
} from "@/lib/laundromat/tv/tv-storage";
import type { TemperatureUnit } from "@/lib/laundromat/weather/weather-reading";
import { cn } from "@/lib/utils";

import { SETTINGS_LCD_CLASS } from "./settings-lcd-class";
import { SETTINGS_META_CLASS } from "./settings-meta-class";
import { SettingsTicketPaper } from "./settings-ticket-paper";
import { useRenderQuality } from "./use-render-quality";

const FEED = { chunkPx: 12, moveMs: 34, restMs: 46, volume: 0.8 };
const PULL_PX_PER_S = 170;
const TEAR = { fadeMs: 200, collapseMs: 300 };
const PLACE = { openMs: 360, dropMs: 380, dropDelayMs: 140, pushMs: 200 };
const PUSH_REST_MS = 120;
const LED_FLASHES_MS = [0, 160, 320, 480];
const REVEAL = { marginPx: 8, scrollMs: 380 };
const PUSH_CLICK_VOLUME = 0.5;
const URL_REVOKE_MS = 1_000;
const LINK_COPIED_AFTER_MS = 1_200;
const RESTORE_AFTER_OPEN_MS = 420;
const COPIED_MS = 1_600;
const LINK_REVEAL = { durationS: 0.24, ease: [0.23, 1, 0.32, 1] as const };

type PrinterDisplay =
  | "ready"
  | "printing"
  | "saved"
  | "linkCopied"
  | "reading"
  | "loaded"
  | "unreadable";

type TicketView = {
  printedAt: Date;
  renderQuality: RenderQualityPreference;
  temperatureUnit: TemperatureUnit;
  switches: RoomSoundSwitches;
  volumes: RoomSoundVolumes;
  tvVolumePercent: number | undefined;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function easeOut(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function animate(options: {
  durationMs: number;
  ease: (progress: number) => number;
  onFrame: (eased: number) => void;
}) {
  return new Promise<void>((resolve) => {
    const startMs = performance.now();
    function tick(nowMs: number) {
      const progress = Math.min(1, (nowMs - startMs) / options.durationMs);
      options.onFrame(options.ease(progress));
      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

function readStoredTv(): SettingsTicketTv | undefined {
  try {
    const station = TV_STATION_IDS.find(
      (id) => id === window.localStorage.getItem(TV_STORAGE_KEYS.station)
    );
    const storedVolume = window.localStorage.getItem(TV_STORAGE_KEYS.volume);
    const isWholePercent =
      storedVolume !== null &&
      /^\d{1,3}$/.test(storedVolume) &&
      Number(storedVolume) <= 100;
    if (station === undefined || !isWholePercent) return undefined;
    return { station, volumePercent: Number(storedVolume) };
  } catch {
    return undefined;
  }
}

function storeTv(tv: SettingsTicketTv) {
  try {
    window.localStorage.setItem(TV_STORAGE_KEYS.station, tv.station);
    window.localStorage.setItem(
      TV_STORAGE_KEYS.volume,
      String(tv.volumePercent)
    );
  } catch {
    return;
  }
  window.dispatchEvent(new Event(TV_RESTORED_EVENT));
}

function downloadFile(options: { text: string; fileName: string }) {
  const blob = new Blob([options.text], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = options.fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), URL_REVOKE_MS);
}

type SettingsTicketPrinterProps = {
  restoreCode: string | undefined;
  onRestoreRead: () => void;
};

/** Let the visitor print their settings as a laundry ticket that downloads as a file and copies a link holding the same ticket, and insert a ticket file (picked or dropped on the slot) or `restoreCode` from a link to restore them, with the paper feeding out and being pulled back in through a slot. */
export function SettingsTicketPrinter(props: SettingsTicketPrinterProps) {
  const { copy } = useLaundromatCopy();
  const sound = useSoundBoard();
  const { preference, setPreference } = useRenderQuality();
  const { unit, setUnit, place, setPlace, condition, setCondition } =
    useLocalWeather();
  const { muted, setMuted } = useSoundMuted();
  const { switches, setSwitches, volumes, setVolumes } = useRoomSounds();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [ticket, setTicket] = useState<TicketView>();
  const [display, setDisplay] = useState<PrinterDisplay>("ready");
  const [isLit, setIsLit] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [link, setLink] = useState<string>();
  const [isCopied, setIsCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const trayRef = useRef<HTMLSpanElement>(null);
  const paperRef = useRef<HTMLSpanElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const trayPxRef = useRef(0);
  const isBusyRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const roomSoundsRef = useRef({ switches, volumes });
  useEffect(() => {
    roomSoundsRef.current = { switches, volumes };
  });

  useEffect(() => {
    function holdFileDrop(event: DragEvent) {
      const transfer = event.dataTransfer;
      if (!transfer?.types.includes("Files")) return;
      event.preventDefault();
      const isOverSlot =
        event.target instanceof Node &&
        dropZoneRef.current?.contains(event.target) === true;
      if (!isOverSlot) transfer.dropEffect = "none";
    }
    window.addEventListener("dragover", holdFileDrop);
    window.addEventListener("drop", holdFileDrop);
    return () => {
      window.removeEventListener("dragover", holdFileDrop);
      window.removeEventListener("drop", holdFileDrop);
    };
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const { restoreCode } = props;
  const insertRef = useRef(insert);
  const onRestoreReadRef = useRef(props.onRestoreRead);
  useEffect(() => {
    insertRef.current = insert;
    onRestoreReadRef.current = props.onRestoreRead;
  });
  useEffect(() => {
    if (restoreCode === undefined) return;
    const timer = window.setTimeout(() => {
      onRestoreReadRef.current();
      void insertRef.current(restoreCode);
    }, RESTORE_AFTER_OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [restoreCode]);

  function later(callback: () => void, delayMs: number) {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((id) => id !== timer);
      callback();
    }, delayMs);
    timersRef.current.push(timer);
  }

  function getScroller() {
    return trayRef.current?.closest<HTMLElement>("[data-settings-scroll]");
  }

  function setTrayPx(heightPx: number) {
    const tray = trayRef.current;
    if (!tray) return;
    const scroller = getScroller();
    const deltaPx = heightPx - trayPxRef.current;
    trayPxRef.current = heightPx;
    tray.style.height = `${heightPx}px`;
    if (scroller) scroller.scrollTop += deltaPx;
  }

  async function revealPrinter() {
    const scroller = getScroller();
    const plate = plateRef.current;
    if (!scroller || !plate) return;
    const overflowPx =
      plate.getBoundingClientRect().bottom +
      REVEAL.marginPx -
      scroller.getBoundingClientRect().bottom;
    if (overflowPx <= 0) return;
    scroller.scrollTo({
      top: scroller.scrollTop + overflowPx,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    if (!prefersReducedMotion) await wait(REVEAL.scrollMs);
  }

  async function tearOffTicket() {
    const paper = paperRef.current;
    if (trayPxRef.current === 0 || !paper) return;
    if (!prefersReducedMotion) {
      await paper.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(-10px)" },
        ],
        { duration: TEAR.fadeMs, easing: "ease-in", fill: "forwards" }
      ).finished;
      const fromPx = trayPxRef.current;
      await animate({
        durationMs: TEAR.collapseMs,
        ease: easeOut,
        onFrame: (eased) => setTrayPx(fromPx * (1 - eased)),
      });
    }
    setTrayPx(0);
    paper.getAnimations().forEach((animation) => animation.cancel());
  }

  async function showTicket(view: TicketView) {
    setTicket(view);
    await nextFrame();
    await nextFrame();
    await revealPrinter();
    return paperRef.current?.offsetHeight ?? 0;
  }

  async function printTicket() {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    const printedAt = new Date();
    const tv = readStoredTv();
    const printed = buildSettingsTicket({
      printedAt,
      renderQuality: preference,
      temperatureUnit: unit,
      weatherPlace: place,
      weatherCondition: condition,
      muted,
      switches,
      volumes,
      tv,
    });
    const printedLink = getSettingsTicketUrl({
      origin: window.location.origin,
      code: encodeSettingsTicketCode(printed),
    });
    const isLinkCopied = copyLink(printedLink);
    await tearOffTicket();
    const heightPx = await showTicket({
      printedAt,
      renderQuality: preference,
      temperatureUnit: unit,
      switches,
      volumes,
      tvVolumePercent: tv?.volumePercent,
    });
    setDisplay("printing");
    setIsLit(true);
    if (prefersReducedMotion) setTrayPx(heightPx);
    for (
      let fedPx = 0;
      !prefersReducedMotion && fedPx < heightPx;
      fedPx += FEED.chunkPx
    ) {
      const fromPx = fedPx;
      const toPx = Math.min(heightPx, fedPx + FEED.chunkPx);
      sound?.play("printer-feed", { volume: FEED.volume });
      await animate({
        durationMs: FEED.moveMs,
        ease: easeOut,
        onFrame: (eased) => setTrayPx(fromPx + (toPx - fromPx) * eased),
      });
      await wait(FEED.restMs);
    }
    downloadFile({
      text: encodeSettingsTicket(printed),
      fileName: `laundro-cafe-no-${getTicketNumber(printedAt)}${SETTINGS_TICKET_FILE_EXTENSION}`,
    });
    setDisplay("saved");
    setIsLit(false);
    setLink(printedLink);
    isBusyRef.current = false;
    if (await isLinkCopied) {
      later(() => {
        if (isBusyRef.current) return;
        setDisplay((current) => (current === "saved" ? "linkCopied" : current));
      }, LINK_COPIED_AFTER_MS);
    }
  }

  function copyLink(url: string) {
    return (
      navigator.clipboard
        ?.writeText(url)
        .then(() => true)
        .catch(() => false) ?? Promise.resolve(false)
    );
  }

  async function copyLinkAgain() {
    if (link === undefined) return;
    if (!(await copyLink(link))) {
      linkInputRef.current?.focus();
      return;
    }
    setIsCopied(true);
    later(() => setIsCopied(false), COPIED_MS);
  }

  function flashUnreadable() {
    setDisplay("unreadable");
    LED_FLASHES_MS.forEach((atMs, index) =>
      later(() => setIsLit(index % 2 === 0), atMs)
    );
    later(() => setIsLit(false), LED_FLASHES_MS.at(-1) ?? 0);
  }

  async function insertFile(file: File | undefined) {
    if (file === undefined) return;
    await insert(await file.text().catch(() => ""));
  }

  async function insert(text: string) {
    if (isBusyRef.current) return;
    const read = readSettingsTicket(decodeSettingsTicket(text));
    if (read === undefined) {
      flashUnreadable();
      return;
    }
    isBusyRef.current = true;
    await tearOffTicket();
    const heightPx = await showTicket({
      printedAt:
        read.printedAt === undefined ? new Date() : new Date(read.printedAt),
      renderQuality: read.renderQuality ?? preference,
      temperatureUnit: read.temperatureUnit ?? unit,
      switches: { ...switches, ...read.switches },
      volumes: { ...volumes, ...read.volumes },
      tvVolumePercent: read.tv?.volumePercent,
    });
    setDisplay("reading");
    setIsLit(true);
    const paper = paperRef.current;
    if (!prefersReducedMotion && paper) {
      const placed = paper.animate(
        [
          { opacity: 0, transform: "translateY(-22px) rotate(-1.5deg)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: PLACE.dropMs,
          delay: PLACE.dropDelayMs,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          fill: "backwards",
        }
      );
      await animate({
        durationMs: PLACE.openMs,
        ease: easeOut,
        onFrame: (eased) => setTrayPx(heightPx * eased),
      });
      await placed.finished;
      sound?.play("knob-click", { volume: PUSH_CLICK_VOLUME });
      await paper.animate(
        [
          { transform: "none" },
          { transform: "translateY(4px)" },
          { transform: "none" },
        ],
        { duration: PLACE.pushMs, easing: "ease-out" }
      ).finished;
      await wait(PUSH_REST_MS);
      const motor = sound?.holdLoop("printer-motor");
      await animate({
        durationMs: (heightPx / PULL_PX_PER_S) * 1000,
        ease: (progress) => progress,
        onFrame: (eased) => setTrayPx(heightPx * (1 - eased)),
      });
      motor?.stop();
    }
    setTrayPx(0);
    setTicket(undefined);
    if (read.renderQuality !== undefined) setPreference(read.renderQuality);
    if (read.temperatureUnit !== undefined) setUnit(read.temperatureUnit);
    if (read.weatherPlace !== undefined) {
      setPlace(read.weatherPlace === "live" ? undefined : read.weatherPlace);
    }
    if (read.weatherCondition !== undefined) {
      setCondition(
        read.weatherCondition === "live" ? undefined : read.weatherCondition
      );
    }
    if (read.muted !== undefined) setMuted(read.muted);
    if (read.tv !== undefined) storeTv(read.tv);
    const current = roomSoundsRef.current;
    setSwitches({ ...current.switches, ...read.switches });
    setVolumes({ ...current.volumes, ...read.volumes });
    setDisplay("loaded");
    setIsLit(false);
    isBusyRef.current = false;
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDropping(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setIsDropping(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDropping(false);
    void insertFile(event.dataTransfer.files[0]);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    void insertFile(file);
  }

  const displayLabels = {
    ready: copy.settings.ticket.ready,
    printing: copy.settings.ticket.printing,
    saved: copy.settings.ticket.saved,
    reading: copy.settings.ticket.reading,
    linkCopied: copy.settings.ticket.linkCopied,
    loaded: copy.settings.ticket.loaded,
    unreadable: copy.settings.ticket.unreadable,
  } satisfies { [state in PrinterDisplay]: string };

  return (
    <section
      aria-labelledby="settings-ticket-heading"
      className="flex flex-col gap-y-3"
    >
      <h3
        id="settings-ticket-heading"
        className={cn(SETTINGS_META_CLASS, "m-0 font-normal opacity-60")}
      >
        {copy.settings.ticket.heading}
      </h3>
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="isolate flex flex-col"
      >
        <span
          ref={trayRef}
          aria-hidden
          className="relative z-[2] flex h-0 translate-y-[5px] items-start justify-center overflow-hidden px-[18px]"
        >
          <span ref={paperRef} className="flex w-full justify-center">
            {ticket !== undefined && <SettingsTicketPaper {...ticket} />}
          </span>
        </span>
        <span
          aria-hidden
          className="relative h-2.5 rounded-t-xl bg-[#1b1c1e] shadow-[inset_0_1px_0_#000,inset_1px_0_0_#000,inset_-1px_0_0_#000]"
        >
          <span
            className={cn(
              "absolute inset-x-3.5 top-[3px] h-1 rounded-[2px] bg-[#050505] transition-shadow duration-200",
              isDropping
                ? "shadow-[inset_0_1px_2px_#000,0_0_0_1px_var(--lm-accent),0_0_10px_color-mix(in_oklab,var(--lm-accent)_60%,transparent)]"
                : "shadow-[inset_0_1px_2px_#000,0_1px_0_rgb(255_255_255/0.05)]"
            )}
          />
          <span className="absolute inset-x-0 top-[5px] bottom-0 z-[3] bg-[#1b1c1e] shadow-[inset_1px_0_0_#000,inset_-1px_0_0_#000]">
            <span className="absolute inset-x-3.5 top-0 h-0.5 rounded-b-[2px] bg-[#050505] shadow-[0_1px_0_rgb(255_255_255/0.05)]" />
          </span>
        </span>
        <div
          ref={plateRef}
          className="flex items-center gap-x-2 rounded-b-xl bg-[linear-gradient(180deg,#1b1c1e,#151617)] px-2.5 pt-1 pb-2.5 shadow-[inset_0_-1px_0_#000,inset_1px_0_0_#000,inset_-1px_0_0_#000,0_1px_0_rgb(255_255_255/0.03)]"
        >
          <span
            aria-hidden
            className={cn(
              "size-[5px] shrink-0 rounded-full transition-[background-color,box-shadow] duration-100",
              isLit
                ? "bg-[var(--lm-accent)] shadow-[0_0_6px_var(--lm-accent),0_0_1px_var(--lm-accent-hi)]"
                : "bg-[#3a2a18] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)]"
            )}
          />
          <span role="status" className={cn(SETTINGS_LCD_CLASS, "flex-1")}>
            {displayLabels[display]}
          </span>
          <button
            type="button"
            onClick={() => void printTicket()}
            aria-label={copy.settings.ticket.printLabel}
            className={PRINTER_KEY_CLASS}
          >
            <svg aria-hidden viewBox="0 0 12 12" className={PRINTER_ICON_CLASS}>
              <path d="M3 4.5V1.5h6v3M3 8.5H1.5v-4h9v4H9M3 7h6v3.5H3z" />
            </svg>
            {copy.settings.ticket.print}
          </button>
          <label
            className={cn(
              PRINTER_KEY_CLASS,
              "has-[:focus-visible]:shadow-[0_0_0_1px_#000,0_0_0_3px_var(--lm-line),0_2px_0_#08090a]"
            )}
          >
            <input
              type="file"
              aria-label={copy.settings.ticket.insertLabel}
              onChange={handleFileChange}
              className="sr-only"
            />
            <svg aria-hidden viewBox="0 0 12 12" className={PRINTER_ICON_CLASS}>
              <path d="M6 1.5v6M3.5 5 6 7.5 8.5 5M1.5 10.5h9" />
            </svg>
            {copy.settings.ticket.insert}
          </label>
        </div>
      </div>
      {link !== undefined && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: LINK_REVEAL.durationS,
            ease: LINK_REVEAL.ease,
          }}
          className="flex flex-col gap-y-1.5"
        >
          <div className="flex items-center gap-x-2">
            <input
              ref={linkInputRef}
              type="text"
              readOnly
              value={link}
              aria-label={copy.settings.ticket.linkLabel}
              onFocus={(event) => event.currentTarget.select()}
              className={cn(
                SETTINGS_LCD_CLASS,
                "flex-1 cursor-text border-0 outline-none focus-visible:ring-1 focus-visible:ring-[var(--lm-line)]"
              )}
            />
            <button
              type="button"
              onClick={() => void copyLinkAgain()}
              className={PRINTER_KEY_CLASS}
            >
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className={PRINTER_ICON_CLASS}
              >
                <path d="M4 4V2h6v6H8M2 4h6v6H2z" />
              </svg>
              {isCopied
                ? copy.settings.ticket.copied
                : copy.settings.ticket.copyLink}
            </button>
          </div>
          <p className={cn(SETTINGS_META_CLASS, "m-0 opacity-60")}>
            {copy.settings.ticket.linkHint}
          </p>
        </motion.div>
      )}
      <p className="m-0 font-[family-name:var(--lm-font-display)] text-[13px] leading-5 text-pretty opacity-60">
        {copy.settings.ticket.hint}
      </p>
    </section>
  );
}

const PRINTER_KEY_CLASS =
  "flex h-8 shrink-0 cursor-pointer items-center gap-x-1.5 rounded-[7px] bg-[linear-gradient(180deg,#2e3033,#1c1d1f)] pr-3 pl-2.5 font-[family-name:var(--lm-font-mono)] text-[11px] leading-4 text-[var(--lm-ink-hi)] lowercase shadow-[0_0_0_1px_#000,inset_0_1px_0_rgb(255_255_255/0.08),0_2px_0_#08090a,0_3px_4px_rgb(0_0_0/0.5)] outline-none transition-[translate,box-shadow] duration-75 focus-visible:shadow-[0_0_0_1px_#000,0_0_0_3px_var(--lm-line),0_2px_0_#08090a] active:translate-y-0.5 active:shadow-[0_0_0_1px_#000,inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.5)]";

const PRINTER_ICON_CLASS =
  "size-3 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1]";
