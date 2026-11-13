import type { AudioSource, AudioState, AudioStation } from "./audio-source";

type YouTubeVideo = { videoId: string; startSeconds?: number };

export type YouTubePlayer = {
  loadVideoById: (video: YouTubeVideo) => void;
  cueVideoById: (video: YouTubeVideo) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (percent: number) => void;
  destroy: () => void;
};

export type YouTubePlayerEvents = {
  onReady: (player: YouTubePlayer) => void;
  onStateChange: (code: number) => void;
  onError: () => void;
};

const YOUTUBE_STATE = {
  unstarted: -1,
  ended: 0,
  playing: 1,
  paused: 2,
  buffering: 3,
  cued: 5,
};

/** Return an `AudioSource` that drives the YouTube player from `createPlayer`, replaying commands sent before it is ready, buffering from the moment it is asked to play even before the player is ready, starting a recorded video at a random time from `random` and again whenever it ends, reporting `error` when a stream fails, a live stream ends, or a stream buffers longer than `stallMs`, and releasing the player through the function `createPlayer` returns when destroyed, whether or not it is ready. */
export function createYouTubeAudioSource(options: {
  createPlayer: (events: YouTubePlayerEvents) => () => void;
  stallMs: number;
  schedule: (callback: () => void, delayMs: number) => () => void;
  random: () => number;
}): AudioSource {
  const desired: {
    station: AudioStation | undefined;
    video: YouTubeVideo | undefined;
    volumePercent: number;
    isPlaying: boolean;
  } = {
    station: undefined,
    video: undefined,
    volumePercent: 100,
    isPlaying: false,
  };
  const listeners = new Set<(state: AudioState) => void>();
  let player: YouTubePlayer | undefined;
  let state: AudioState = "idle";
  let cancelStall: (() => void) | undefined;
  let isDestroyed = false;

  function emit(next: AudioState) {
    if (next === state) return;
    state = next;
    listeners.forEach((listener) => listener(next));
  }

  function stopStallTimer() {
    cancelStall?.();
    cancelStall = undefined;
  }

  function enterBuffering() {
    emit("buffering");
    if (cancelStall !== undefined) return;
    cancelStall = options.schedule(() => {
      cancelStall = undefined;
      emit("error");
    }, options.stallMs);
  }

  function pickVideo(station: AudioStation): YouTubeVideo {
    if (station.lengthSeconds === undefined) {
      return { videoId: station.videoId };
    }
    return {
      videoId: station.videoId,
      startSeconds: Math.floor(options.random() * station.lengthSeconds),
    };
  }

  function loadDesiredVideo(target: YouTubePlayer) {
    if (desired.video === undefined) return;
    if (desired.isPlaying) {
      target.loadVideoById(desired.video);
      enterBuffering();
    } else {
      target.cueVideoById(desired.video);
    }
  }

  function handleStateCode(code: number) {
    switch (code) {
      case YOUTUBE_STATE.playing:
        stopStallTimer();
        emit("playing");
        return;
      case YOUTUBE_STATE.paused:
        stopStallTimer();
        emit("paused");
        return;
      case YOUTUBE_STATE.ended:
        stopStallTimer();
        if (
          desired.station?.lengthSeconds !== undefined &&
          player !== undefined
        ) {
          desired.video = pickVideo(desired.station);
          loadDesiredVideo(player);
          return;
        }
        emit("error");
        return;
      case YOUTUBE_STATE.buffering:
      case YOUTUBE_STATE.unstarted:
      case YOUTUBE_STATE.cued:
        if (desired.isPlaying) enterBuffering();
        return;
    }
  }

  const releasePlayer = options.createPlayer({
    onReady(ready) {
      if (isDestroyed) {
        ready.destroy();
        return;
      }
      player = ready;
      ready.setVolume(desired.volumePercent);
      loadDesiredVideo(ready);
    },
    onStateChange(code) {
      if (!isDestroyed) handleStateCode(code);
    },
    onError() {
      if (isDestroyed) return;
      stopStallTimer();
      emit("error");
    },
  });

  return {
    play() {
      if (desired.isPlaying) return;
      desired.isPlaying = true;
      if (desired.video === undefined) return;
      player?.playVideo();
      enterBuffering();
    },
    pause() {
      desired.isPlaying = false;
      stopStallTimer();
      player?.pauseVideo();
      emit("paused");
    },
    setVolume(percent) {
      desired.volumePercent = Math.min(100, Math.max(0, percent));
      player?.setVolume(desired.volumePercent);
    },
    setStation(station) {
      if (station.videoId === desired.video?.videoId) return;
      desired.station = station;
      desired.video = pickVideo(station);
      stopStallTimer();
      if (player !== undefined) loadDesiredVideo(player);
      else if (desired.isPlaying) enterBuffering();
    },
    onStateChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      if (isDestroyed) return;
      isDestroyed = true;
      stopStallTimer();
      listeners.clear();
      releasePlayer();
      player = undefined;
    },
  };
}
