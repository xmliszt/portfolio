import { useCallback, useEffect, useRef, useState } from "react";

import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { NotificationAvailability } from "@/lib/laundromat/laundry/describe-machine-control";
import { getTabTitle } from "@/lib/laundromat/laundry/get-tab-title";
import type {
  LaundryEvent,
  MachineRef,
} from "@/lib/laundromat/laundry/laundry-state";
import { INITIAL_LAUNDRY_STATE } from "@/lib/laundromat/laundry/laundry-state";
import { parseLaundryState } from "@/lib/laundromat/laundry/parse-laundry-state";
import { transitionLaundry } from "@/lib/laundromat/laundry/transition-laundry";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";
import { readOrCreateLocalVisitorId } from "./read-or-create-local-visitor-id";
import { showNotification } from "./show-notification";

const LAUNDRY_STORAGE_KEY_PREFIX = "laundromat:laundry:";
const TICK_MS = 1000;

function readNotificationAvailability(): NotificationAvailability {
  return "Notification" in window ? Notification.permission : "unsupported";
}

function showDoneNotification(options: {
  machine: MachineRef;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.machine;
  const { machine } = options;
  showNotification({
    title: copy.doneNotificationTitle({
      name: copy.name(machine).toLocaleLowerCase(options.copy.locale),
    }),
    body: copy.doneNotificationBody({ kind: machine.kind }),
    tag: `laundromat-${machine.id}`,
  });
}

/** Return this visitor's id and laundry state, kept in `localStorage`, ticking while a cycle runs, with the tab title and done notification kept in step. */
export function useLaundry() {
  const { copy } = useLaundromatCopy();
  const [state, setState] = useState(INITIAL_LAUNDRY_STATE);
  const [storageKey, setStorageKey] = useState<string>();
  const [visitorId, setVisitorId] = useState<string>();
  const [now, setNow] = useState(() => Date.now());
  const [notifications, setNotifications] =
    useState<NotificationAvailability>("unsupported");
  const previousLoadRef = useRef(state.load);

  function dispatch(event: LaundryEvent) {
    setState((current) =>
      transitionLaundry({
        state: current,
        event,
        machines: sceneConfig.machines,
      })
    );
  }

  const tick = useCallback(() => {
    const tickedAt = Date.now();
    setNow(tickedAt);
    setState((current) =>
      transitionLaundry({
        state: current,
        event: { type: "tick", now: tickedAt },
        machines: sceneConfig.machines,
      })
    );
  }, []);

  useEffect(() => {
    const id = readOrCreateLocalVisitorId();
    setVisitorId(id);
    const key = `${LAUNDRY_STORAGE_KEY_PREFIX}${id}`;
    const restored = parseLaundryState(window.localStorage.getItem(key));
    if (restored !== undefined) setState(restored);
    setStorageKey(key);
    setNotifications(readNotificationAvailability());
  }, []);

  useEffect(() => {
    if (storageKey === undefined) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    if (storageKey === undefined) return;
    function handleStorage(event: StorageEvent) {
      if (event.key !== storageKey) return;
      const synced = parseLaundryState(event.newValue);
      if (synced !== undefined) setState(synced);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  const isRunning = state.load.kind === "running";
  useEffect(() => {
    if (!isRunning) return;
    tick();
    const interval = window.setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isRunning, tick]);

  const endsAt =
    state.load.kind === "running"
      ? state.load.startedAt + state.load.durationMs
      : undefined;
  useEffect(() => {
    if (endsAt === undefined) return;
    const timeout = window.setTimeout(tick, Math.max(0, endsAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [endsAt, tick]);

  useEffect(() => {
    const originalTitle = document.title;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  const tabTitle = getTabTitle({ state, now, copy });
  useEffect(() => {
    function applyTitle() {
      if (document.title !== tabTitle) document.title = tabTitle;
    }
    applyTitle();
    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [tabTitle]);

  useEffect(() => {
    const previous = previousLoadRef.current;
    previousLoadRef.current = state.load;
    const isJustDone = previous.kind === "running" && previous.remind;
    if (
      isJustDone &&
      state.load.kind === "done" &&
      readNotificationAvailability() === "granted"
    ) {
      showDoneNotification({ machine: state.load.machine, copy });
    }
  }, [state.load, copy]);

  function start(machine: MachineRef) {
    dispatch({ type: "start", machine, now: Date.now() });
    void remind(machine);
  }

  async function remind(machine: MachineRef) {
    if (!("Notification" in window)) return;
    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
    setNotifications(permission);
    if (permission === "granted") dispatch({ type: "remind", machine });
  }

  return { visitorId, state, now, notifications, dispatch, start, remind };
}
