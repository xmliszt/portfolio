"use client";

import { useEffect, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { getBoardEntries } from "@/lib/laundromat/board/get-board-entries";
import { isNewBoardEntry } from "@/lib/laundromat/board/is-new-board-entry";
import type { BoardEntry } from "@/lib/laundromat/board/parse-board-entries";
import { parseBoardEntries } from "@/lib/laundromat/board/parse-board-entries";
import { LAUNDROMAT_BASE_PATH } from "@/lib/laundromat/hosts";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { isNewerBuild } from "@/lib/laundromat/is-newer-build";
import { parseBuildId } from "@/lib/laundromat/parse-build-id";

import { LaundromatUpdateContext } from "./laundromat-update-context";

const CHECK_INTERVAL_MS = 5 * 60_000;
const OWN_BUILD_ID = process.env.LAUNDROMAT_BUILD_ID;
const IS_DEPLOYED_BUILD =
  OWN_BUILD_ID !== undefined && OWN_BUILD_ID !== "development";

type LaundromatUpdateProviderProps = {
  children: React.ReactNode;
};

type DeployedUpdate = {
  locale: LaundromatLocale;
  entries: BoardEntry[] | undefined;
};

/** Provide whether the deployed laundromat runs a different build than this tab, with that build's board entries when it sent them in the visitor's current language and this tab's own entries otherwise, checking every `CHECK_INTERVAL_MS`, whenever the tab comes back into view, and again when the language changes after an update is found; never in development. */
export function LaundromatUpdateProvider(props: LaundromatUpdateProviderProps) {
  const { copy } = useLaundromatCopy();
  const { locale } = copy;
  const [deployed, setDeployed] = useState<DeployedUpdate>();
  const entries =
    (deployed?.locale === locale ? deployed.entries : undefined) ??
    getBoardEntries({ copy });

  useEffect(() => {
    if (!IS_DEPLOYED_BUILD || deployed?.locale === locale) return;
    const controller = new AbortController();
    async function check() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(
          `${LAUNDROMAT_BASE_PATH}/version?locale=${encodeURIComponent(locale)}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!response.ok) return;
        const body: unknown = await response.json();
        const deployedBuildId = parseBuildId(body);
        setDeployed(
          isNewerBuild({ ownBuildId: OWN_BUILD_ID, deployedBuildId })
            ? { locale, entries: parseBoardEntries(body) }
            : undefined
        );
      } catch {
        return;
      }
    }
    if (deployed !== undefined) void check();
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, [deployed, locale]);

  return (
    <LaundromatUpdateContext.Provider
      value={
        deployed === undefined
          ? { kind: "current" }
          : {
              kind: "ready",
              entries,
              hasNewEntries: entries.some((entry) => isNewBoardEntry(entry.id)),
            }
      }
    >
      {props.children}
    </LaundromatUpdateContext.Provider>
  );
}
