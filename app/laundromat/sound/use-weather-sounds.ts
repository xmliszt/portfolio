"use client";

import { useEffect, useRef } from "react";

import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import { randomBetween } from "@/lib/laundromat/audio/sounds/random-between";
import { getWeatherLoops } from "@/lib/laundromat/weather/get-weather-loops";

import { useRoomSounds } from "./use-room-sounds";
import { useSoundBoard } from "./use-sound-board";

const THUNDER_MIN_DELAY_MS = 1_200;
const THUNDER_MAX_DELAY_MS = 5_000;

/** Play the rain outside the window, in the bedroom and the laundromat alike, and a roll of thunder a few seconds after each lightning strike, while the visitor keeps the weather room sound on. */
export function useWeatherSounds() {
  const sound = useSoundBoard();
  const { reading, lightningStrikes } = useLocalWeather();
  const { switches } = useRoomSounds();
  const heardCondition = switches.weather ? reading?.condition : undefined;
  const handledStrikesRef = useRef(lightningStrikes);

  useEffect(() => {
    if (sound === undefined) return;
    const loops = getWeatherLoops(heardCondition);
    loops.forEach((loop) => sound.startLoop(loop));
    return () => loops.forEach((loop) => sound.stopLoop(loop));
  }, [sound, heardCondition]);

  useEffect(() => {
    const isNewStrike = lightningStrikes > handledStrikesRef.current;
    handledStrikesRef.current = lightningStrikes;
    if (!isNewStrike || sound === undefined || heardCondition !== "thunder") {
      return;
    }
    const timer = window.setTimeout(
      () => sound.play("thunder-rumble"),
      randomBetween({ min: THUNDER_MIN_DELAY_MS, max: THUNDER_MAX_DELAY_MS })
    );
    return () => window.clearTimeout(timer);
  }, [sound, heardCondition, lightningStrikes]);
}
