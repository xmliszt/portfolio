import { useEffect, useRef, useState } from "react";

import type {
  AudioSource,
  AudioState,
} from "@/lib/laundromat/audio/audio-source";
import { createHiddenYouTubeAudioSource } from "@/lib/laundromat/audio/create-hidden-youtube-audio-source";
import { shouldSkipStation } from "@/lib/laundromat/audio/should-skip-station";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import type { TvState } from "@/lib/laundromat/tv/tv-state";

export function useTvAudio(options: {
  tv: TvState;
  details: SceneConfig["details"]["tv"];
  muted: boolean;
  onSkipStation: () => void;
}) {
  const { tv, details, muted, onSkipStation } = options;
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const sourceRef = useRef<AudioSource>(undefined);
  const failedStreakRef = useRef(0);
  const onSkipStationRef = useRef(onSkipStation);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const videoId = details.stations[tv.station]?.videoId;
  const stallMs = details.stallSeconds * 1000;

  useEffect(() => {
    onSkipStationRef.current = onSkipStation;
  });

  useEffect(() => () => sourceRef.current?.destroy(), []);

  useEffect(() => {
    if (!tv.on) {
      sourceRef.current?.pause();
      sourceRef.current?.destroy();
      sourceRef.current = undefined;
      return;
    }
    if (muted || videoId === undefined || container === null) {
      sourceRef.current?.pause();
      return;
    }
    const source =
      sourceRef.current ??
      createHiddenYouTubeAudioSource({ container, stallMs });
    if (sourceRef.current === undefined) {
      source.onStateChange((state) => {
        if (state === "playing") failedStreakRef.current = 0;
        if (state === "error") failedStreakRef.current += 1;
        setAudioState(state);
      });
      sourceRef.current = source;
    }
    source.setVolume(tv.volumePercent);
    source.setStation(videoId);
    source.play();
  }, [container, tv.on, tv.volumePercent, muted, videoId, stallMs]);

  const isNoSignal = tv.on && audioState === "error";
  const stationCount = details.stations.length;
  useEffect(() => {
    if (!isNoSignal) return;
    if (
      !shouldSkipStation({
        failedStreak: failedStreakRef.current,
        stationCount,
      })
    ) {
      return;
    }
    const timeout = window.setTimeout(
      () => onSkipStationRef.current(),
      details.noSignalMs
    );
    return () => window.clearTimeout(timeout);
  }, [isNoSignal, stationCount, details.noSignalMs]);

  return { setContainer, audioState, isNoSignal };
}
