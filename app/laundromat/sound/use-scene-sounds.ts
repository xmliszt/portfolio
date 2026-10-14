"use client";

import { useEffect, useRef, useState } from "react";

import type { LoopName } from "@/lib/laundromat/audio/sound-names";
import type { CoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import { LAMP_FLICKER_MS } from "@/lib/laundromat/lamp-flicker-steps";
import { getArrivedVisitorIds } from "@/lib/laundromat/realtime/get-arrived-visitor-ids";
import { getUnloadedVisitorIds } from "@/lib/laundromat/realtime/get-unloaded-visitor-ids";
import type { RoomPresence } from "@/lib/laundromat/realtime/room-presence";

import type { SoundBoard } from "./sound-board-context";
import { useRoomSounds } from "./use-room-sounds";

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

/** Play the room's loops and one-shots as its machines, coffee, tv, lamp, laundry, focus and other visitors' arrivals and laundry change, ring the shop bell as the visitor walks in, skip each room sound group the visitor turned off, stay silent while the visitor is not `isInside`, and return the lamp switch moment (`on` while it flickers on, `off` as it snaps off) or `undefined`. */
export function useSceneSounds(options: {
  sound: SoundBoard | undefined;
  isWasherRunning: boolean;
  isDryerRunning: boolean;
  coffeeKind: CoffeePhase["kind"];
  isTvHissing: boolean;
  isLampOn: boolean | undefined;
  loadKind: string;
  peers: RoomPresence[] | undefined;
  ownVisitorId: string | undefined;
  isInside: boolean;
  focus: string;
}) {
  const { coffeeKind, isLampOn, loadKind, peers, isInside, focus } = options;
  const sound = isInside ? options.sound : undefined;
  const { switches } = useRoomSounds();
  useLoop({
    sound,
    name: "washer-running",
    playing: switches.machines && options.isWasherRunning,
  });
  useLoop({
    sound,
    name: "dryer-running",
    playing: switches.machines && options.isDryerRunning,
  });
  useLoop({
    sound,
    name: "coffee-brewing",
    playing: switches.coffee && coffeeKind === "brewing",
  });
  useLoop({
    sound,
    name: "tv-no-signal",
    playing: switches.tv && options.isTvHissing,
  });

  useOnChange({
    value: coffeeKind,
    onChange: ({ previous, current }) => {
      if (switches.coffee && previous === "brewing" && current === "ready") {
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
    value: peers,
    onChange: ({ previous, current }) => {
      if (previous === undefined || current === undefined) return;
      const changes = { previous, current, ownVisitorId: options.ownVisitorId };
      if (
        switches["shop-bell"] &&
        isInside &&
        getArrivedVisitorIds(changes).length > 0
      ) {
        sound?.play("shop-bell", { volume: 0.5 });
      }
      if (switches.unloading && getUnloadedVisitorIds(changes).length > 0) {
        sound?.play("door-latch-open");
        sound?.play("collect-laundry", { volume: 0.5 });
      }
    },
  });

  useOnChange({
    value: isInside,
    onChange: ({ current }) => {
      if (current && switches["shop-bell"]) sound?.play("shop-bell");
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
      if (switches.lamp) sound?.play(current ? "lamp-flicker" : "lamp-off");
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
