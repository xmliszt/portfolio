"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { LanguagePicker } from "@/app/paws/_i18n/language-picker";
import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { usePawsSession } from "@/app/paws/_session/use-paws-session";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { PawsOnboarding } from "@/app/paws/_ui/paws-onboarding";
import { createRoomEngine } from "@/lib/paws/client/create-room-engine";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { getBorrowedMeowUrl } from "@/lib/paws/profile/get-borrowed-meow-url";
import { createSceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";
import { getWorldView } from "@/lib/paws/render/get-world-view";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { createPawsSoundPlayer } from "@/lib/paws/sound/create-paws-sound-player";
import type { ChatMessage } from "@/lib/paws/wire-types";
import { cn } from "@/lib/utils";

import { ChatLayer, COMPOSE_ANCHOR_PREFIX } from "./chat-layer";
import { postChat } from "./post-chat";
import { useRoomConnection } from "./use-room-connection";
import { useSavedCat } from "./use-saved-cat";

const MAX_DPR = 2;
const MAX_DT_SECONDS = 0.05;
const FAKE_VOICE = { age: "adult", voice: "soft", mood: "chatty" } as const;
const BUBBLE_BASE_MS = 2500;
const BUBBLE_PER_CHARACTER_MS = 70;
const MAX_BUBBLE_MS = 8000;
const BUBBLE_GAP_PX = 10;

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** Render the room: the shared cats, every fingertip and print on a full-screen canvas, the visitor's own fingertip from the pointer, sounds, and the corner flow for bringing a cat in. */
export function PawsRoom() {
  const { copy } = usePawsCopy();

  const { session, actions, client } = usePawsSession();
  const { savedCat, setSavedCat, isChecked } = useSavedCat(session);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorsRef = useRef<{ [key: string]: HTMLElement | undefined }>({});
  const bubbleTimersRef = useRef<{ [userId: string]: number | undefined }>({});
  const spokenIdsRef = useRef<string[]>([]);
  const lastCatsRef = useRef<DerivedCat[]>([]);
  const [bubbles, setBubbles] = useState<ChatMessage[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [hasOwnCatInRoom, setHasOwnCatInRoom] = useState(false);
  const ownUserId = session.kind === "loading" ? undefined : session.userId;
  const engine = useMemo(() => createRoomEngine({ random: Math.random }), []);
  const [sound] = useState(() =>
    createPawsSoundPlayer({ createContext: () => new AudioContext() })
  );
  const [useFakeRoom] = useState(
    () =>
      process.env.NODE_ENV !== "production" &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("fake")
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
        meowUrl: getBorrowedMeowUrl(FAKE_VOICE),
      };
    }
    return undefined;
  })();
  function sayLine(message: ChatMessage) {
    showBubble(message);
    if (spokenIdsRef.current.includes(message.id)) return;
    spokenIdsRef.current = [...spokenIdsRef.current, message.id].slice(-20);
    const player = playersRef.current.find(
      (candidate) => candidate.userId === message.userId
    );
    const cat = lastCatsRef.current.find(
      (candidate) => candidate.userId === message.userId
    );
    if (player === undefined) return;
    sound.speak({
      userId: message.userId,
      text: message.text,
      x: cat?.x ?? ROOM_LIMITS.worldWidth / 2,
      voice: player.voice,
      size: player.look.size,
    });
  }

  function showBubble(message: ChatMessage) {
    window.clearTimeout(bubbleTimersRef.current[message.userId]);
    setBubbles((current) =>
      current.some((bubble) => bubble.id === message.id)
        ? current
        : [
            ...current.filter((bubble) => bubble.userId !== message.userId),
            message,
          ]
    );
    bubbleTimersRef.current[message.userId] = window.setTimeout(
      () => {
        setBubbles((current) =>
          current.filter((bubble) => bubble.id !== message.id)
        );
      },
      Math.min(
        MAX_BUBBLE_MS,
        BUBBLE_BASE_MS +
          Array.from(message.text).length * BUBBLE_PER_CHARACTER_MS
      )
    );
  }

  const ownCatIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    ownCatIdRef.current = self === undefined ? undefined : self.userId;
  }, [self]);

  const { connectionRef, playersRef, roomIdRef } = useRoomConnection({
    session,
    client,
    self,
    engine,
    useFakeRoom,
    isReady: isChecked || useFakeRoom,
    onChat: sayLine,
  });

  useEffect(() => {
    const timers = bubbleTimersRef.current;
    return () => Object.values(timers).forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!hasOwnCatInRoom) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        isTypingTarget(event.target) ||
        document.querySelector("[aria-modal=true]") !== null
      )
        return;
      event.preventDefault();
      setIsComposing(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasOwnCatInRoom]);

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
      paperSeed: Math.random(),
    });
    const ownCat = { isHere: false };
    const frame: { id: number; lastMs: number } = {
      id: 0,
      lastMs: performance.now(),
    };

    function tick(nowMs: number) {
      if (canvas === null || g === null || g === undefined) return;
      const dtSeconds = Math.min(
        MAX_DT_SECONDS,
        Math.max(0, (nowMs - frame.lastMs) / 1000)
      );
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
      const view = getWorldView({ width, height });
      lastCatsRef.current = room.cats;
      const ownCatId = ownCatIdRef.current;
      const isOwnCatHere =
        ownCatId !== undefined &&
        room.cats.some((cat) => cat.userId === ownCatId);
      if (isOwnCatHere !== ownCat.isHere) {
        ownCat.isHere = isOwnCatHere;
        setHasOwnCatInRoom(isOwnCatHere);
      }
      for (const [key, element] of Object.entries(anchorsRef.current)) {
        if (element === undefined) continue;
        const userId = key.startsWith(COMPOSE_ANCHOR_PREFIX)
          ? key.slice(COMPOSE_ANCHOR_PREFIX.length)
          : key;
        const cat = room.cats.find((candidate) => candidate.userId === userId);
        if (cat === undefined) {
          element.style.opacity = "0";
          continue;
        }
        const x = cat.head[0] * view.scale + view.offsetX;
        const y =
          (cat.head[1] - cat.head[2]) * view.scale +
          view.offsetY -
          BUBBLE_GAP_PX;
        element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        element.style.opacity = "1";
      }
      drawScene({
        g,
        width,
        height,
        dpr,
        view,
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
  }, [engine, sound, connectionRef, playersRef, ownCatIdRef]);

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

  async function handleSend(text: string) {
    const roomId = roomIdRef.current;
    if (session.kind === "loading" || roomId === undefined) return "failed";
    const result = await postChat({
      accessToken: session.accessToken,
      roomId,
      text,
    });
    if (result.kind === "sent") sayLine(result.message);
    return result.kind;
  }

  function handleTalk() {
    void sound.unlock();
    setIsComposing(true);
  }

  function handleCloseCompose() {
    setIsComposing(false);
  }

  function handleToggleMute() {
    void sound.unlock();
    setIsMuted((muted) => !muted);
  }

  return (
    <div className="group/room absolute inset-0">
      <canvas
        ref={canvasRef}
        aria-label={copy.site.description}
        className="absolute inset-0 size-full touch-none [@media(pointer:fine)]:cursor-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerLeave}
        onPointerLeave={handlePointerLeave}
      />
      <div className="absolute top-4 right-4 flex items-center gap-x-2 group-has-[[aria-modal=true]]/room:hidden sm:top-6 sm:right-6">
        <LanguagePicker />
        {hasOwnCatInRoom && (
          <button
            type="button"
            onClick={handleTalk}
            aria-keyshortcuts="/"
            className={cn(
              FOCUS_RING_CLASS,
              "h-10 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
            )}
          >
            {copy.room.talk}
          </button>
        )}
        <button
          type="button"
          onClick={handleToggleMute}
          className={cn(
            FOCUS_RING_CLASS,
            "h-10 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
          )}
        >
          {isMuted ? copy.room.unmute : copy.room.mute}
        </button>
      </div>
      <ChatLayer
        bubbles={bubbles}
        ownUserId={ownUserId}
        isComposing={isComposing && hasOwnCatInRoom}
        anchors={anchorsRef}
        onSend={handleSend}
        onCloseCompose={handleCloseCompose}
      />
      <PawsOnboarding
        session={session}
        actions={actions}
        hasCat={savedCat !== undefined}
        onBringCatIn={(cat) => setSavedCat(cat)}
      />
    </div>
  );
}
