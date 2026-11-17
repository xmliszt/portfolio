import { useRef, useState } from "react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { getDecorationSound } from "@/lib/laundromat/decorations/get-decoration-sound";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

export function useDecorationReactions(details: SceneConfig["details"]) {
  const sound = useSoundBoard();
  const settings = details.decorationReaction;
  const [reactions, setReactions] = useState<{ [id: string]: number }>({});
  const busyUntilRef = useRef<{ [id: string]: number }>({});

  function activate(object: SceneDecoration) {
    const soundName = getDecorationSound(object);
    const now = performance.now();
    if (
      soundName === undefined ||
      document.hidden ||
      now < (busyUntilRef.current[object.id] ?? 0)
    )
      return;
    busyUntilRef.current[object.id] =
      now +
      (object.kind === "pumpkin"
        ? Math.max(1100, details.pumpkin.bounceMs)
        : Math.max(1500, settings.durationMs));
    sound?.play(soundName, { volume: settings.soundVolume });
    setReactions((current) => ({
      ...current,
      [object.id]: (current[object.id] ?? 0) + 1,
    }));
  }

  return { reactions, activate };
}
