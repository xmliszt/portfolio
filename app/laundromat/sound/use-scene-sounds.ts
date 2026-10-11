"use client";

import { useEffect, useRef, useState } from "react";

import type { LoopName } from "@/lib/laundromat/audio/sound-names";
import type { CoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import { LAMP_FLICKER_MS } from "@/lib/laundromat/lamp-flicker-steps";

import type { SoundBoard } from "./sound-board-context";

const LAMP_OFF_MS = 200;

export type LampSwitch = "on" | "off";

function useLoop(options: {
  sound: SoundBoard | undefined;
  name: LoopName;
  playing: boolean;
}) {
  const { sound, name, playing } = options;
  useEffect(() => {
    if (sound === undefined || !playing) return;
    sound.startLoop(name);
    return () => sound.stopLoop(name);
  }, [sound, name, playing]);
}

function useOnChange<T>(options: {
  value: T;
  onChange: (change: { previous: T; current: T }) => void | (() => void);
}) {
  const { value } = options;
  const previousRef = useRef(value);
  const onChangeRef = useRef(options.onChange);
  useEffect(() => {
    onChangeRef.current = options.onChange;
  });
  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = value;
    if (Object.is(previous, value)) return;
    return onChangeRef.current({ previous, current: value });
  }, [value]);
}

/** Play the room's loops and one-shots as its machines, coffee, tv, lamp, laundry and focus change, and return the lamp switch moment (`on` while it flickers on, `off` as it snaps off) or `undefined`. */
export function useSceneSounds(options: {
  sound: SoundBoard | undefined;
  isWasherRunning: boolean;
  isDryerRunning: boolean;
  coffeeKind: CoffeePhase["kind"];
  isTvHissing: boolean;
  isLampOn: boolean | undefined;
  loadKind: string;
  focus: string;
}) {
  const { sound, coffeeKind, isLampOn, loadKind, focus } = options;
  useLoop({ sound, name: "washer-running", playing: options.isWasherRunning });
  useLoop({ sound, name: "dryer-running", playing: options.isDryerRunning });
  useLoop({ sound, name: "coffee-brewing", playing: coffeeKind === "brewing" });
  useLoop({ sound, name: "tv-no-signal", playing: options.isTvHissing });

  useOnChange({
    value: coffeeKind,
    onChange: ({ previous, current }) => {
      if (previous === "brewing" && current === "hot") {
        sound?.play("coffee-brew-done");
      }
    },
  });

  useOnChange({
    value: loadKind,
    onChange: ({ previous, current }) => {
      if (previous === "running" && current === "done") {
        sound?.play("done-ding");
      }
    },
  });

  useOnChange({
    value: focus,
    onChange: ({ current }) => {
      if (current === "notebook") sound?.play("notebook-open");
    },
  });

  const [lampSwitch, setLampSwitch] = useState<LampSwitch>();
  useOnChange({
    value: isLampOn,
    onChange: ({ previous, current }) => {
      if (previous === undefined || current === undefined) return;
      sound?.play(current ? "lamp-flicker" : "lamp-off");
      setLampSwitch(current ? "on" : "off");
      const timer = window.setTimeout(
        () => setLampSwitch(undefined),
        current ? LAMP_FLICKER_MS : LAMP_OFF_MS
      );
      return () => {
        window.clearTimeout(timer);
        setLampSwitch(undefined);
      };
    },
  });

  return lampSwitch;
}
