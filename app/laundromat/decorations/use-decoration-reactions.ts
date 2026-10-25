import { useRef, useState } from "react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

const REACTION_SOUNDS = {
  skeleton: "skeleton-shy",
  pumpkin: "pumpkin-tap",
  ghost: "ghost-boo",
} as const;

export function useDecorationReactions(details: SceneConfig["details"]) {
  const sound = useSoundBoard();
  const settings = details.decorationReaction;
  const [reactions, setReactions] = useState<{ [id: string]: number }>({});
  const busyUntilRef = useRef<{ [id: string]: number }>({});

  function activate(options: {
    id: string;
    kind: keyof typeof REACTION_SOUNDS;
  }) {
    const now = performance.now();
    if (document.hidden || now < (busyUntilRef.current[options.id] ?? 0))
      return;
    busyUntilRef.current[options.id] =
      now +
      (options.kind === "pumpkin"
        ? Math.max(1100, details.pumpkin.bounceMs)
        : Math.max(1500, settings.durationMs));
    sound?.play(REACTION_SOUNDS[options.kind], {
      volume: settings.soundVolume,
    });
    setReactions((current) => ({
      ...current,
      [options.id]: (current[options.id] ?? 0) + 1,
    }));
  }

  return { reactions, activate };
}
