import type { YouTubePlayer } from "./create-youtube-audio-source";

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

type YouTubePlayerOptions = {
  width: number;
  height: number;
  playerVars: { [name: string]: number };
  events: {
    onReady: () => void;
    onStateChange: (event: { data: number }) => void;
    onError: () => void;
  };
};

export type YouTubeIframeApi = {
  Player: new (
    element: HTMLElement,
    options: YouTubePlayerOptions
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: Partial<YouTubeIframeApi>;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function getReadyApi(): YouTubeIframeApi | undefined {
  const Player = window.YT?.Player;
  return Player === undefined ? undefined : { Player };
}

/** Load the YouTube IFrame API script once per page and resolve with its `Player` constructor. */
export function loadYouTubeIframeApi() {
  return new Promise<YouTubeIframeApi>((resolve, reject) => {
    const ready = getReadyApi();
    if (ready !== undefined) {
      resolve(ready);
      return;
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      const api = getReadyApi();
      if (api === undefined) reject(new Error("YouTube IFrame API missing"));
      else resolve(api);
    };
    if (document.querySelector(`script[src="${IFRAME_API_SRC}"]`) !== null) {
      return;
    }
    const script = document.createElement("script");
    script.src = IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => reject(new Error("YouTube IFrame API failed"));
    document.head.append(script);
  });
}
