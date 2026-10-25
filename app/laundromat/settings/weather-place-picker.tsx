"use client";

import { useEffect, useId, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { LAUNDROMAT_BASE_PATH } from "@/lib/laundromat/hosts";
import { parsePlacesBody } from "@/lib/laundromat/weather/parse-places-body";
import type { WeatherPlace } from "@/lib/laundromat/weather/weather-place";
import { cn } from "@/lib/utils";

import { LiveGlyph } from "./live-glyph";
import { SETTINGS_META_CLASS } from "./settings-meta-class";

const SEARCH_DELAY_MS = 250;
const MIN_QUERY_LENGTH = 2;

type PlaceOption = { kind: "live" } | { kind: "place"; place: WeatherPlace };

type SearchState =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "done"; places: WeatherPlace[] };

function describePlace(place: WeatherPlace) {
  return [place.region, place.country]
    .filter((part) => part !== undefined && part !== place.name)
    .join(", ");
}

function PinGlyph() {
  return (
    <path
      d="M 0 9.5 C -4.5 4.5 -6.5 1.2 -6.5 -2.5 A 6.5 6.5 0 0 1 6.5 -2.5 C 6.5 1.2 4.5 4.5 0 9.5 Z M 0 -0.2 A 2.3 2.3 0 1 0 0 -4.8 A 2.3 2.3 0 1 0 0 -0.2 Z"
      className="fill-none stroke-[var(--lm-ink-hi)]"
      strokeWidth={1.3}
      strokeLinejoin="round"
    />
  );
}

function OptionGlyph(props: { option: PlaceOption }) {
  return (
    <svg aria-hidden viewBox="-12 -12 24 24" className="size-4 shrink-0">
      {props.option.kind === "live" ? <LiveGlyph /> : <PinGlyph />}
    </svg>
  );
}

/** Let the visitor search for a city to take the weather from, or go back to the live weather where their IP address puts them, from a combobox listing "live" above the search results. */
export function WeatherPlacePicker() {
  const { copy } = useLaundromatCopy();
  const { place, setPlace, liveCity } = useLocalWeather();
  const sound = useSoundBoard();
  const listId = useId();
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ kind: "idle" });
  const [activeIndex, setActiveIndex] = useState(0);
  const trimmedQuery = query.trim();
  const isSearchable = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const options: PlaceOption[] = [
    { kind: "live" },
    ...(isSearchable && search.kind === "done"
      ? search.places.map((found) => ({ kind: "place" as const, place: found }))
      : []),
  ];
  const liveLabel =
    liveCity === undefined
      ? copy.settings.placeLive
      : `${copy.settings.placeLive} · ${liveCity}`;

  useEffect(() => {
    if (!isOpen || !isSearchable) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearch({ kind: "searching" });
      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          language: copy.locale,
        });
        const response = await fetch(
          `${LAUNDROMAT_BASE_PATH}/weather/places?${params.toString()}`,
          { signal: controller.signal }
        );
        const places = response.ok
          ? parsePlacesBody(await response.json())
          : [];
        setSearch({ kind: "done", places });
      } catch {
        if (!controller.signal.aborted) setSearch({ kind: "done", places: [] });
      }
    }, SEARCH_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, isSearchable, trimmedQuery, copy.locale]);

  function open() {
    if (isOpen) return;
    setQuery("");
    setSearch({ kind: "idle" });
    setActiveIndex(0);
    setOpen(true);
  }

  function isCurrent(option: PlaceOption) {
    return option.kind === "live"
      ? place === undefined
      : place !== undefined &&
          option.place.latitude === place.latitude &&
          option.place.longitude === place.longitude;
  }

  function pick(option: PlaceOption) {
    if (!isCurrent(option)) sound?.play("knob-click");
    setPlace(option.kind === "live" ? undefined : option.place);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        open();
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((activeIndex + step + options.length) % options.length);
      return;
    }
    if (!isOpen) return;
    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option !== undefined) pick(option);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  }

  const status = (() => {
    if (!isSearchable) return undefined;
    if (search.kind !== "done") return copy.settings.placeSearching;
    return search.places.length === 0
      ? copy.settings.placeNoResults
      : undefined;
  })();
  const activeOption = options[activeIndex];

  return (
    <div className="relative">
      <div className="flex h-9 items-center gap-x-2 rounded-full pr-3 pl-2.5 shadow-[inset_0_0_0_1px_var(--lm-edge)] has-[:focus-visible]:shadow-[inset_0_0_0_1px_var(--lm-ink)]">
        <OptionGlyph
          option={
            place === undefined ? { kind: "live" } : { kind: "place", place }
          }
        />
        <input
          type="text"
          role="combobox"
          aria-label={copy.settings.placeLabel}
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && activeOption !== undefined
              ? `${listId}-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={copy.settings.placePlaceholder}
          value={isOpen ? query : (place?.name ?? liveLabel)}
          onFocus={open}
          onClick={open}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            open();
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 truncate bg-transparent text-[13px] leading-5 text-[var(--lm-ink-hi)] outline-none placeholder:text-[var(--lm-ink)] placeholder:opacity-80 [@media(pointer:coarse)]:text-[16px]"
        />
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "size-3 shrink-0 fill-none stroke-[var(--lm-ink)] transition-transform duration-200 motion-reduce:transition-none",
            isOpen && "rotate-180"
          )}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-10 flex flex-col gap-y-0.5 rounded-[18px] bg-[var(--lm-panel)] p-1 shadow-[0_0_0_1px_var(--lm-edge),0_10px_30px_rgb(0_0_0/0.45)]">
          <ul
            id={listId}
            role="listbox"
            className="m-0 flex list-none flex-col gap-y-0.5 p-0"
          >
            {options.map((option, index) => {
              const detail =
                option.kind === "live"
                  ? (liveCity ?? copy.settings.placeNearYou)
                  : describePlace(option.place);
              return (
                <li
                  key={
                    option.kind === "live"
                      ? "live"
                      : `${option.place.latitude},${option.place.longitude}`
                  }
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onPointerDown={(event) => event.preventDefault()}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => pick(option)}
                  className="flex h-9 cursor-pointer items-center gap-x-2 rounded-[14px] px-2.5 text-[var(--lm-ink)] aria-selected:bg-[color-mix(in_oklab,var(--lm-ink)_8%,transparent)] aria-selected:text-[var(--lm-ink-hi)]"
                >
                  <OptionGlyph option={option} />
                  <span className="shrink-0 text-[13px] leading-5">
                    {option.kind === "live"
                      ? copy.settings.placeLive
                      : option.place.name}
                  </span>
                  <span
                    className={cn(
                      SETTINGS_META_CLASS,
                      "min-w-0 flex-1 truncate opacity-80"
                    )}
                  >
                    {detail}
                  </span>
                  {isCurrent(option) && (
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full bg-[var(--lm-accent)]"
                    />
                  )}
                </li>
              );
            })}
          </ul>
          {status !== undefined && (
            <p
              role="status"
              className={cn(SETTINGS_META_CLASS, "m-0 px-2.5 py-2 opacity-80")}
            >
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
