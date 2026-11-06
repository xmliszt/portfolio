"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chunk } from "lodash";

import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { MAX_TRANSLATED_ENTRIES } from "@/lib/laundromat/notebook/max-translated-entries";

import { translateNotebookEntries } from "./notebook-actions";

type Translation =
  | { kind: "pending" }
  | { kind: "failed" }
  | {
      kind: "done";
      body: string | undefined;
      isRevealing: boolean;
    };

export type ShownTranslation =
  | { kind: "original"; canTranslate: boolean }
  | { kind: "pending" }
  | {
      kind: "translated";
      body: string;
      isRevealing: boolean;
    };

function toKey(options: { entryId: number; locale: LaundromatLocale }) {
  return `${options.entryId}:${options.locale}`;
}

/** Keep notebook entries' translations into `locale`: fetch them for `visibleEntryIds` while `isActive` and `isAuto`, or one at a time through `translate`, and return what each entry should show. */
export function useEntryTranslations(options: {
  locale: LaundromatLocale;
  isAuto: boolean;
  isActive: boolean;
  visibleEntryIds: number[];
  loadFont: (text: string) => Promise<unknown>;
  onFailure: () => void;
}) {
  const [translations, setTranslations] = useState<{
    [key: string]: Translation;
  }>({});
  const [choices, setChoices] = useState<{
    [entryId: number]: "translated" | "original";
  }>({});
  const requestedRef = useRef<{ [key: string]: true }>({});
  const { locale, isAuto, isActive, loadFont, onFailure } = options;

  const markAllRevealed = useCallback(
    () =>
      setTranslations((current) =>
        Object.fromEntries(
          Object.entries(current).map(([key, translation]) => [
            key,
            translation.kind === "done"
              ? { ...translation, isRevealing: false }
              : translation,
          ])
        )
      ),
    []
  );

  useEffect(() => {
    setChoices({});
    markAllRevealed();
  }, [isAuto, locale, markAllRevealed]);

  useEffect(() => {
    if (!isActive) markAllRevealed();
  }, [isActive, markAllRevealed]);

  const requestBatch = useCallback(
    async (entryIds: number[]) => {
      const ids = entryIds.filter(
        (entryId) => requestedRef.current[toKey({ entryId, locale })] !== true
      );
      if (ids.length === 0) return;
      ids.forEach((entryId) => {
        requestedRef.current[toKey({ entryId, locale })] = true;
      });
      setTranslations((current) => ({
        ...current,
        ...Object.fromEntries(
          ids.map((entryId) => [
            toKey({ entryId, locale }),
            { kind: "pending" },
          ])
        ),
      }));
      const result = await translateNotebookEntries({
        entryIds: ids,
        locale,
      }).catch(() => ({ kind: "offline" as const }));
      const answered = result.kind === "translated" ? result.translations : [];
      await Promise.all(
        answered.map((translation) =>
          translation.body === undefined
            ? undefined
            : loadFont(translation.body).catch(() => undefined)
        )
      );
      const failedIds = ids.filter(
        (entryId) =>
          !answered.some((translation) => translation.entryId === entryId)
      );
      failedIds.forEach((entryId) => {
        delete requestedRef.current[toKey({ entryId, locale })];
      });
      if (failedIds.length > 0) onFailure();
      setTranslations((current) => ({
        ...current,
        ...Object.fromEntries([
          ...failedIds.map((entryId) => [
            toKey({ entryId, locale }),
            { kind: "failed" },
          ]),
          ...answered.map((translation) => [
            toKey({ entryId: translation.entryId, locale }),
            {
              kind: "done",
              body: translation.body,
              isRevealing: true,
            },
          ]),
        ]),
      }));
    },
    [locale, loadFont, onFailure]
  );

  const request = useCallback(
    (entryIds: number[]) =>
      Promise.all(chunk(entryIds, MAX_TRANSLATED_ENTRIES).map(requestBatch)),
    [requestBatch]
  );

  const wantedIds = options.visibleEntryIds.filter(
    (entryId) => choices[entryId] !== "original"
  );
  const wantedKey = wantedIds.join(",");
  useEffect(() => {
    if (!isActive || !isAuto || wantedKey === "") return;
    void request(wantedKey.split(",").map(Number));
  }, [isActive, isAuto, wantedKey, request]);

  const getShown = useCallback(
    (entryId: number): ShownTranslation => {
      const translation = translations[toKey({ entryId, locale })];
      const isWanted =
        (choices[entryId] ?? (isAuto ? "translated" : "original")) ===
        "translated";
      if (translation?.kind === "done" && translation.body === undefined) {
        return { kind: "original", canTranslate: false };
      }
      if (!isWanted) return { kind: "original", canTranslate: true };
      if (translation?.kind === "pending") {
        return choices[entryId] === "translated"
          ? { kind: "pending" }
          : { kind: "original", canTranslate: false };
      }
      if (translation?.kind === "done" && translation.body !== undefined) {
        return {
          kind: "translated",
          body: translation.body,
          isRevealing: translation.isRevealing,
        };
      }
      return { kind: "original", canTranslate: true };
    },
    [translations, choices, locale, isAuto]
  );

  function translate(entryId: number) {
    setChoices((current) => ({ ...current, [entryId]: "translated" }));
    void request([entryId]);
  }

  function showOriginal(entryId: number) {
    setChoices((current) => ({ ...current, [entryId]: "original" }));
    const key = toKey({ entryId, locale });
    setTranslations((current) => {
      const translation = current[key];
      return translation?.kind === "done"
        ? { ...current, [key]: { ...translation, isRevealing: false } }
        : current;
    });
  }

  return { getShown, translate, showOriginal };
}
