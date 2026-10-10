import type { YouTubePlayer } from "./create-youtube-audio-source";
import { createYouTubeAudioSource } from "./create-youtube-audio-source";
import { loadYouTubeIframeApi } from "./load-youtube-iframe-api";

const PLAYER_SIZE_PX = 200;

/** Return an `AudioSource` backed by a control-less YouTube player mounted inside `container`, loading the IFrame API on first call. */
export function createHiddenYouTubeAudioSource(options: {
  container: HTMLElement;
  stallMs: number;
}) {
  return createYouTubeAudioSource({
    stallMs: options.stallMs,
    schedule: (callback, delayMs) => {
      const timeout = window.setTimeout(callback, delayMs);
      return () => window.clearTimeout(timeout);
    },
    createPlayer: (events) => {
      loadYouTubeIframeApi()
        .then((api) => {
          const mount = document.createElement("div");
          options.container.append(mount);
          const player: YouTubePlayer = new api.Player(mount, {
            width: PLAYER_SIZE_PX,
            height: PLAYER_SIZE_PX,
            playerVars: { controls: 0, disablekb: 1, playsinline: 1 },
            events: {
              onReady: () => events.onReady(player),
              onStateChange: (event) => events.onStateChange(event.data),
              onError: events.onError,
            },
          });
        })
        .catch(events.onError);
    },
  });
}
