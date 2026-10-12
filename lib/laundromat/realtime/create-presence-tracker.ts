import { getNextTrackAt } from "./get-next-track-at";

/** Return a tracker that sends the latest presence through `track` while subscribed, skips one equal to the last sent, sends again after a resubscribe or a `track` reported undelivered, holds a send back until fewer than `limit` of `sends.sentAts` fall within `windowMs` (`limit - reservedForUrgent` unless `isUrgent` holds for it against the last one `track` reported delivered in this subscription), records each send in `sends.sentAts`, and reports through `onUrgentReadyChange` whether an urgent send would go out now. */
export function createPresenceTracker<T>(options: {
  limit: number;
  reservedForUrgent: number;
  windowMs: number;
  sends: { sentAts: number[] };
  now: () => number;
  schedule: (options: { run: () => void; delayMs: number }) => () => void;
  track: (presence: T) => Promise<boolean>;
  isUrgent: (change: { presence: T; delivered: T | undefined }) => boolean;
  onUrgentReadyChange: (isReady: boolean) => void;
}) {
  const state: {
    latest?: T;
    sentKey?: string;
    delivered?: { presence: T; sendId: number };
    sendId: number;
    subscribedAtSendId: number;
    cancelSendTimer?: () => void;
    cancelReadyTimer?: () => void;
    isUrgentReady: boolean;
    isSubscribed: boolean;
    isDisposed: boolean;
  } = {
    sendId: 0,
    subscribedAtSendId: 0,
    isUrgentReady: false,
    isSubscribed: false,
    isDisposed: false,
  };

  function getTrackAt(at: { now: number; limit: number }) {
    return getNextTrackAt({
      sentAts: options.sends.sentAts,
      now: at.now,
      limit: at.limit,
      windowMs: options.windowMs,
    });
  }

  function cancelSendTimer() {
    state.cancelSendTimer?.();
    state.cancelSendTimer = undefined;
  }

  function refreshUrgentReady() {
    state.cancelReadyTimer?.();
    state.cancelReadyTimer = undefined;
    if (state.isDisposed) return;
    const now = options.now();
    const readyAt = getTrackAt({ now, limit: options.limit });
    const isReady = state.isSubscribed && readyAt <= now;
    if (isReady !== state.isUrgentReady) {
      state.isUrgentReady = isReady;
      options.onUrgentReadyChange(isReady);
    }
    if (!state.isSubscribed || isReady) return;
    state.cancelReadyTimer = options.schedule({
      delayMs: readyAt - now,
      run: () => {
        state.cancelReadyTimer = undefined;
        refreshUrgentReady();
      },
    });
  }

  function flush() {
    cancelSendTimer();
    const presence = state.latest;
    if (!state.isSubscribed || presence === undefined) return;
    const key = JSON.stringify(presence);
    if (key === state.sentKey) return;
    const isUrgent = options.isUrgent({
      presence,
      delivered: state.delivered?.presence,
    });
    const now = options.now();
    const trackAt = getTrackAt({
      now,
      limit: isUrgent
        ? options.limit
        : options.limit - options.reservedForUrgent,
    });
    if (trackAt > now) {
      state.cancelSendTimer = options.schedule({
        delayMs: trackAt - now,
        run: () => {
          state.cancelSendTimer = undefined;
          flush();
        },
      });
      return;
    }
    options.sends.sentAts = [...options.sends.sentAts, now].slice(
      -options.limit
    );
    const sendId = state.sendId + 1;
    state.sendId = sendId;
    state.sentKey = key;
    void options
      .track(presence)
      .catch(() => false)
      .then((isDelivered) => {
        if (isDelivered) {
          if (sendId > (state.delivered?.sendId ?? state.subscribedAtSendId)) {
            state.delivered = { presence, sendId };
          }
          return;
        }
        if (state.sendId !== sendId) return;
        state.sentKey = undefined;
        flush();
      });
    refreshUrgentReady();
  }

  return {
    update(presence: T) {
      state.latest = presence;
      flush();
    },
    setSubscribed(isSubscribed: boolean) {
      state.isSubscribed = isSubscribed;
      if (!isSubscribed) {
        state.sentKey = undefined;
        state.delivered = undefined;
        state.sendId += 1;
        state.subscribedAtSendId = state.sendId;
      }
      flush();
      refreshUrgentReady();
    },
    dispose() {
      cancelSendTimer();
      state.cancelReadyTimer?.();
      state.cancelReadyTimer = undefined;
      state.isSubscribed = false;
      state.isDisposed = true;
    },
  };
}
