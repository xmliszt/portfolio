"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePawsSession } from "@/app/paws/_session/use-paws-session";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { PawsOnboarding } from "@/app/paws/_ui/paws-onboarding";
import { createRoomEngine } from "@/lib/paws/client/create-room-engine";
import { COPY } from "@/lib/paws/copy";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { createSceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";
import { getWorldView } from "@/lib/paws/render/get-world-view";
import { createPawsSoundPlayer } from "@/lib/paws/sound/create-paws-sound-player";
import { cn } from "@/lib/utils";

import { useRoomConnection } from "./use-room-connection";
import { useSavedCat } from "./use-saved-cat";

const MAX_DPR = 2;
const MAX_DT_SECONDS = 0.05;
const FAKE_VOICE = { age: "adult", voice: "soft", mood: "chatty" } as const;
const FAKE_MEOW_URL = "/paws/sounds/meow-adult-soft-chatty.mp3";

/** Render the room: the shared cats, every fingertip and print on a full-screen canvas, the visitor's own fingertip from the pointer, sounds, and the corner flow for bringing a cat in. */
export function PawsRoom() {
  const { session, actions, client } = usePawsSession();
  const { savedCat, setSavedCat, isChecked } = useSavedCat(session);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useMemo(() => createRoomEngine({ random: Math.random }), []);
  const [sound] = useState(() =>
    createPawsSoundPlayer({ createContext: () => new AudioContext() })
  );
  const useFakeRoom = useMemo(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("fake"),
    []
  );
  const [fakeLook] = useState(() => shuffleCatLook({ random: Math.random }));
  const self = (() => {
    if (session.kind === "member" && savedCat !== undefined) {
      return {
        userId: session.userId,
        look: savedCat.look,
        voice: savedCat.voice,
        meowUrl: savedCat.meowUrl,
      };
    }
    if (useFakeRoom && session.kind !== "loading") {
      return {
        userId: session.userId,
        look: fakeLook,
        voice: FAKE_VOICE,
        meowUrl: FAKE_MEOW_URL,
      };
    }
    return undefined;
  })();
  const { connectionRef, playersRef } = useRoomConnection({
    session,
    client,
    self,
    engine,
    useFakeRoom,
    isReady: isChecked || useFakeRoom,
  });

  useEffect(() => {
    sound.setMuted(isMuted);
  }, [sound, isMuted]);

  useEffect(() => () => sound.dispose(), [sound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (canvas === null || g === null || g === undefined) return;
    const resources = createSceneResources({
      createCanvas: ({ width, height }) => {
        const created = document.createElement("canvas");
        created.width = width;
        created.height = height;
        return created;
      },
    });
    const frame: { id: number; lastMs: number } = {
      id: 0,
      lastMs: performance.now(),
    };

    function tick(nowMs: number) {
      if (canvas === null || g === null || g === undefined) return;
      const dtSeconds = Math.min(MAX_DT_SECONDS, (nowMs - frame.lastMs) / 1000);
      frame.lastMs = nowMs;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (
        canvas.width !== Math.round(width * dpr) ||
        canvas.height !== Math.round(height * dpr)
      ) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const room = engine.frame({ nowMs, dtSeconds });
      const connection = connectionRef.current;
      if (connection !== undefined) {
        if (room.outgoing.cats !== undefined)
          connection.sendCats(room.outgoing.cats);
        if (room.outgoing.finger !== undefined)
          connection.sendFinger(room.outgoing.finger);
        for (const event of room.outgoing.events) connection.sendEvent(event);
      }
      for (const event of room.sounds) {
        const player = playersRef.current.find(
          (candidate) => candidate.userId === event.userId
        );
        const cat = room.cats.find(
          (candidate) => candidate.userId === event.userId
        );
        if (player === undefined || cat === undefined) continue;
        sound.play({
          userId: event.userId,
          sound: event.sound,
          meowUrl: player.meowUrl,
          x: cat.x,
          size: player.look.size,
          age: player.voice.age,
        });
      }
      drawScene({
        g,
        width,
        height,
        dpr,
        view: getWorldView({ width, height }),
        cats: room.cats,
        prints: room.prints,
        fingers: room.fingers,
        time: room.time,
        resources,
      });
      frame.id = window.requestAnimationFrame(tick);
    }

    frame.id = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame.id);
  }, [engine, sound, connectionRef, playersRef]);

  function toWorld(event: React.PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const view = getWorldView({ width: bounds.width, height: bounds.height });
    return {
      x: (event.clientX - bounds.left - view.offsetX) / view.scale,
      y: (event.clientY - bounds.top - view.offsetY) / view.scale,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const isTouch = event.pointerType !== "mouse";
    const pressed = (event.buttons & 1) === 1;
    engine.setOwnPointer({
      ...toWorld(event),
      present: !isTouch || pressed,
      pressed,
    });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    void sound.unlock();
    event.currentTarget.setPointerCapture(event.pointerId);
    engine.setOwnPointer({ ...toWorld(event), present: true, pressed: true });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    engine.setOwnPointer({
      ...toWorld(event),
      present: event.pointerType === "mouse",
      pressed: false,
    });
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLCanvasElement>) {
    engine.setOwnPointer({ ...toWorld(event), present: false, pressed: false });
  }

  function handleToggleMute() {
    void sound.unlock();
    setIsMuted((muted) => !muted);
  }

  return (
    <div className="group/room absolute inset-0">
      <canvas
        ref={canvasRef}
        aria-label={COPY.site.description}
        className="absolute inset-0 size-full touch-none [@media(pointer:fine)]:cursor-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerLeave}
        onPointerLeave={handlePointerLeave}
      />
      <button
        type="button"
        onClick={handleToggleMute}
        className={cn(
          FOCUS_RING_CLASS,
          "absolute top-4 right-4 h-10 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] group-has-[[aria-modal=true]]/room:hidden hover:bg-[var(--pw-paper-deep)] sm:top-6 sm:right-6 sm:h-8"
        )}
      >
        {isMuted ? COPY.room.unmute : COPY.room.mute}
      </button>
      <PawsOnboarding
        session={session}
        actions={actions}
        hasCat={savedCat !== undefined}
        onBringCatIn={(cat) => setSavedCat(cat)}
      />
    </div>
  );
}
