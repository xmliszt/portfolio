import assert from "node:assert/strict";
import { test } from "node:test";

import type { AudioState } from "./audio-source";
import type {
  YouTubePlayer,
  YouTubePlayerEvents,
} from "./create-youtube-audio-source";
import { createYouTubeAudioSource } from "./create-youtube-audio-source";

function buildFakePlayer() {
  const calls: string[] = [];
  const player: YouTubePlayer = {
    loadVideoById: (videoId) => calls.push(`load ${videoId}`),
    cueVideoById: (videoId) => calls.push(`cue ${videoId}`),
    playVideo: () => calls.push("play"),
    pauseVideo: () => calls.push("pause"),
    setVolume: (percent) => calls.push(`volume ${percent}`),
    destroy: () => calls.push("destroy"),
  };
  return { player, calls };
}

function buildSource() {
  const { player, calls } = buildFakePlayer();
  const timers: {
    callback: () => void;
    delayMs: number;
    cancelled: boolean;
  }[] = [];
  const states: AudioState[] = [];
  const captured: {
    events: YouTubePlayerEvents | undefined;
    releaseCount: number;
  } = {
    events: undefined,
    releaseCount: 0,
  };
  const source = createYouTubeAudioSource({
    stallMs: 8000,
    createPlayer: (events) => {
      captured.events = events;
      return () => {
        captured.releaseCount += 1;
      };
    },
    schedule: (callback, delayMs) => {
      const timer = { callback, delayMs, cancelled: false };
      timers.push(timer);
      return () => {
        timer.cancelled = true;
      };
    },
  });
  source.onStateChange((state) => states.push(state));
  function events() {
    assert.ok(captured.events, "createPlayer was called");
    return captured.events;
  }
  function fireStall() {
    timers
      .filter((timer) => !timer.cancelled)
      .forEach((timer) => timer.callback());
  }
  return {
    source,
    player,
    calls,
    states,
    timers,
    events,
    fireStall,
    captured,
  };
}

test("replays station, volume and play sent before the player is ready", () => {
  const { source, player, calls, events } = buildSource();
  source.setVolume(40);
  source.setStation("abc");
  source.play();
  assert.deepEqual(calls, []);
  events().onReady(player);
  assert.deepEqual(calls, ["volume 40", "load abc"]);
});

test("cues the station without playing it while paused", () => {
  const { source, player, calls, events } = buildSource();
  events().onReady(player);
  source.setStation("abc");
  assert.deepEqual(calls, ["volume 100", "cue abc"]);
});

test("loads a new station while playing and ignores the same station twice", () => {
  const { source, player, calls, events } = buildSource();
  events().onReady(player);
  source.setStation("abc");
  source.play();
  source.setStation("def");
  source.setStation("def");
  assert.deepEqual(calls, ["volume 100", "cue abc", "play", "load def"]);
});

test("maps YouTube player states to audio states", () => {
  const { source, player, states, events } = buildSource();
  events().onReady(player);
  source.setStation("abc");
  source.play();
  events().onStateChange(3);
  events().onStateChange(1);
  events().onStateChange(2);
  assert.deepEqual(states, ["buffering", "playing", "paused"]);
});

test("reports an error when a live stream ends", () => {
  const { source, player, states, events } = buildSource();
  events().onReady(player);
  source.setStation("abc");
  source.play();
  events().onStateChange(1);
  events().onStateChange(0);
  assert.equal(states.at(-1), "error");
});

test("reports an error once when buffering outlasts the stall time", () => {
  const { source, player, states, timers, events, fireStall } = buildSource();
  events().onReady(player);
  source.setStation("abc");
  source.play();
  events().onStateChange(3);
  assert.equal(timers.filter((timer) => !timer.cancelled).length, 1);
  assert.equal(timers.at(0)?.delayMs, 8000);
  fireStall();
  assert.deepEqual(states, ["buffering", "error"]);
});

test("cancels the stall timer once the stream plays", () => {
  const { source, player, states, events, fireStall } = buildSource();
  events().onReady(player);
  source.setStation("abc");
  source.play();
  events().onStateChange(1);
  fireStall();
  assert.deepEqual(states, ["buffering", "playing"]);
});

test("reports a player error and clamps volume to 0–100%", () => {
  const { source, player, calls, states, events } = buildSource();
  events().onReady(player);
  source.setVolume(140);
  source.setVolume(-5);
  events().onError();
  assert.deepEqual(calls, ["volume 100", "volume 100", "volume 0"]);
  assert.deepEqual(states, ["error"]);
});

test("destroys a player that becomes ready after the source was destroyed", () => {
  const { source, player, calls, states, events } = buildSource();
  source.destroy();
  events().onReady(player);
  events().onError();
  assert.deepEqual(calls, ["destroy"]);
  assert.deepEqual(states, []);
});

test("releases the player when destroyed before it is ready", () => {
  const { source, captured } = buildSource();
  source.destroy();
  assert.equal(captured.releaseCount, 1);
});

test("releases a ready player once when destroyed", () => {
  const { source, player, calls, events, captured } = buildSource();
  events().onReady(player);
  source.destroy();
  source.destroy();
  assert.equal(captured.releaseCount, 1);
  assert.equal(calls.includes("destroy"), false);
});
