import { useEffect, useState } from "react";

import { LAUNDROMAT_BASE_PATH } from "@/lib/laundromat/hosts";
import { parseBuildId } from "@/lib/laundromat/parse-build-id";

const CHECK_INTERVAL_MS = 5 * 60_000;
const OWN_BUILD_ID = process.env.LAUNDROMAT_BUILD_ID;

/** Return `true` once the deployed laundromat runs a different build than this tab, checking every `CHECK_INTERVAL_MS` and whenever the tab comes back into view; `false` until then and always in development. */
export function useIsUpdateAvailable() {
  const [isUpdateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (OWN_BUILD_ID === undefined || OWN_BUILD_ID === "development") return;
    if (isUpdateAvailable) return;
    const controller = new AbortController();
    async function check() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`${LAUNDROMAT_BASE_PATH}/version`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const buildId = parseBuildId(await response.json());
        if (buildId !== undefined && buildId !== OWN_BUILD_ID) {
          setUpdateAvailable(true);
        }
      } catch {
        return;
      }
    }
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, [isUpdateAvailable]);

  return isUpdateAvailable;
}
