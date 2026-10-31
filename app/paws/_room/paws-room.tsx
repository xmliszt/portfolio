"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { LanguagePicker } from "@/app/paws/_i18n/language-picker";
import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { usePawsSession } from "@/app/paws/_session/use-paws-session";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { PawsOnboarding } from "@/app/paws/_ui/paws-onboarding";
import type { SavedCat } from "@/lib/paws/cat-api-types";
import { COAT_INKS } from "@/lib/paws/cat-look";
import { getRevealSteps } from "@/lib/paws/chat/get-reveal-steps";
import {
  createRoomEngine,
  type RoomFrame,
} from "@/lib/paws/client/create-room-engine";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { createSceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";
import { getWorldView } from "@/lib/paws/render/get-world-view";
import { RISO } from "@/lib/paws/riso-inks";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { getRoomNumber } from "@/lib/paws/rooms/get-room-number";
import { LOCAL_ROOM_ID } from "@/lib/paws/rooms/local-room-id";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { createPawsSoundPlayer } from "@/lib/paws/sound/create-paws-sound-player";
import type { ChatMessage } from "@/lib/paws/wire-types";
import { cn } from "@/lib/utils";

import type { ChatBubble } from "./chat-bubble";
import { ChatLayer } from "./chat-layer";
import { COMPOSE_ANCHOR_PREFIX } from "./compose-anchor-prefix";
import { PanBar, type PanBarHandle } from "./pan-bar";
import { PortfolioLink } from "./portfolio-link";
import { postChat } from "./post-chat";
import { RoomBanner } from "./room-banner";
import { RoomLoading } from "./room-loading";
import { RoomPicker } from "./room-picker";
import { SoundSwitch } from "./sound-switch";
import { UiSoundContext } from "./ui-sound-context";
import { useRoomConnection } from "./use-room-connection";
import { useSavedCat } from "./use-saved-cat";

const MAX_DPR = 2;
const KEY_PAN_SPEED = 700;
const PAN_KEYS: { [key: string]: -1 | 1 | undefined } = {
  ArrowLeft: -1,
  a: -1,
  A: -1,
  ArrowRight: 1,
  d: 1,
  D: 1,
};
const MAX_DT_SECONDS = 0.05;
const FAKE_VOICE = { age: "adult", voice: "soft", mood: "chatty" } as const;
const BUBBLE_HOLD_MS = 2500;
const MAX_BUBBLE_MS = 12000;
const BUBBLE_GAP_PX = 10;
const BUBBLE_EDGE_PX = 8;
const SETTLE_BEFORE_ARRIVALS_MS = 3000;
const ROOM_BANNER_MS = 2600;
const RESIDENT_LINE_EVERY_MS = 15_000;
const RESIDENT_LINE_CHANCE = { alone: 0.25, shared: 0.06 } as const;

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
  const latestOwnLineIdRef = useRef<string | undefined>(undefined);
  const lastCatsRef = useRef<DerivedCat[]>([]);
  const residentsRef = useRef<RoomFrame["residents"]>([]);
  const sayLineRef = useRef(sayLine);
  const centerXRef = useRef(ROOM_LIMITS.worldWidth / 2);
  const heldPanKeysRef = useRef<{ [key: string]: -1 | 1 | undefined }>({});
  const touchesRef = useRef<{ [pointerId: number]: number | undefined }>({});
  const pinchRef = useRef<
    { startMidX: number; startCenterX: number } | undefined
  >(undefined);
  const panBarRef = useRef<PanBarHandle | undefined>(undefined);
  const [isPannable, setIsPannable] = useState(false);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [hasOwnCatInRoom, setHasOwnCatInRoom] = useState(false);
  const ownUserId = "userId" in session ? session.userId : undefined;
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
      };
    }
    if (useFakeRoom && "userId" in session) {
      return {
        userId: session.userId,
        look: fakeLook,
        voice: FAKE_VOICE,
      };
    }
    return undefined;
  })();
  function sayLine(message: ChatMessage) {
    if (spokenIdsRef.current.includes(message.id)) return;
    spokenIdsRef.current = [...spokenIdsRef.current, message.id].slice(-20);
    const player = [...playersRef.current, ...residentsRef.current].find(
      (candidate) => candidate.userId === message.userId
    );
    if (player === undefined) return;
    const reveal = getRevealSteps({
      text: message.text,
      voice: player.voice,
      size: player.look.size,
      userId: message.userId,
    });
    showBubble({ message, accent: COAT_INKS[player.look.coat], reveal });
    const cat = lastCatsRef.current.find(
      (candidate) => candidate.userId === message.userId
    );
    sound.speak({
      userId: message.userId,
      text: message.text,
      x: cat?.x ?? ROOM_LIMITS.worldWidth / 2,
      voice: player.voice,
      size: player.look.size,
    });
  }

  function retractLine(message: ChatMessage) {
    const { userId, id } = message;
    if (latestOwnLineIdRef.current !== id) return;
    window.clearTimeout(bubbleTimersRef.current[userId]);
    delete bubbleTimersRef.current[userId];
    setBubbles((current) => current.filter((shown) => shown.message.id !== id));
    sound.hush(userId);
  }

  function showBubble(bubble: ChatBubble) {
    const { userId, id } = bubble.message;
    window.clearTimeout(bubbleTimersRef.current[userId]);
    setBubbles((current) => [
      ...current.filter((shown) => shown.message.userId !== userId),
      bubble,
    ]);
    bubbleTimersRef.current[userId] = window.setTimeout(
      () => {
        delete bubbleTimersRef.current[userId];
        setBubbles((current) =>
          current.filter((shown) => shown.message.id !== id)
        );
      },
      Math.min(
        MAX_BUBBLE_MS,
        (bubble.reveal.at(-1)?.atMs ?? 0) + BUBBLE_HOLD_MS
      )
    );
  }

  const ownCatIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    ownCatIdRef.current = self === undefined ? undefined : self.userId;
  }, [self]);

  const { connectionRef, playersRef, roomIdRef, roomId, isFull, switchRoom } =
    useRoomConnection({
      session,
      client,
      self,
      engine,
      useFakeRoom,
      isReady: isChecked || useFakeRoom,
      onChat: sayLine,
    });

  const [enteredRoomId, setEnteredRoomId] = useState<string | undefined>(
    undefined
  );
  const [banner, setBanner] = useState<
    { roomId: string; isMove: boolean } | undefined
  >(undefined);
  if (
    roomId !== undefined &&
    roomId !== LOCAL_ROOM_ID &&
    roomId !== enteredRoomId
  ) {
    setEnteredRoomId(roomId);
    setBanner({ roomId, isMove: enteredRoomId !== undefined });
  }

  useEffect(() => {
    if (banner === undefined) return;
    const timer = window.setTimeout(() => setBanner(undefined), ROOM_BANNER_MS);
    return () => window.clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    const timers = bubbleTimersRef.current;
    return () => Object.values(timers).forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    sayLineRef.current = sayLine;
  });

  useEffect(() => {
    const lines = copy.room.residentLines;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const chance =
        playersRef.current.length > 1
          ? RESIDENT_LINE_CHANCE.shared
          : RESIDENT_LINE_CHANCE.alone;
      if (Math.random() > chance) return;
      const speakers = residentsRef.current.filter((resident) =>
        lastCatsRef.current.some((cat) => cat.userId === resident.userId)
      );
      const speaker = speakers.at(Math.floor(Math.random() * speakers.length));
      const text = lines.at(Math.floor(Math.random() * lines.length));
      if (speaker === undefined || text === undefined) return;
      sayLineRef.current({
        id: crypto.randomUUID(),
        userId: speaker.userId,
        text,
      });
    }, RESIDENT_LINE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [copy.room.residentLines, playersRef]);

  useEffect(() => {
    if (!isPannable) return;
    const held = heldPanKeysRef.current;
    function handleKeyDown(event: KeyboardEvent) {
      const direction = PAN_KEYS[event.key];
      if (
        direction === undefined ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTypingTarget(event.target) ||
        document.querySelector("[aria-modal=true]") !== null
      )
        return;
      event.preventDefault();
      held[event.key.toLowerCase()] = direction;
    }
    function handleKeyUp(event: KeyboardEvent) {
      delete held[event.key.toLowerCase()];
    }
    function releaseAll() {
      for (const key of Object.keys(held)) delete held[key];
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseAll);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseAll);
      releaseAll();
    };
  }, [isPannable]);

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
      sound.playUi("chatOpen");
      setIsComposing(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasOwnCatInRoom, sound]);

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
    const pan = { isPannable: false };
    const arrivals: {
      roomId: string | undefined;
      since: number;
      seen: Set<string>;
    } = { roomId: undefined, since: 0, seen: new Set() };
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
      const playerIds = playersRef.current.map((player) => player.userId);
      if (arrivals.roomId !== roomIdRef.current) {
        arrivals.roomId = roomIdRef.current;
        arrivals.since = nowMs;
        arrivals.seen = new Set(playerIds);
      }
      const isNewcomer = (userId: string) =>
        !arrivals.seen.has(userId) && userId !== ownCatIdRef.current;
      if (
        nowMs - arrivals.since > SETTLE_BEFORE_ARRIVALS_MS &&
        playerIds.some(isNewcomer)
      )
        sound.playUi("catJoins");
      playerIds.forEach((userId) => arrivals.seen.add(userId));
      const connection = connectionRef.current;
      if (connection !== undefined) {
        if (room.outgoing.cats !== undefined)
          connection.sendCats(room.outgoing.cats);
        if (room.outgoing.finger !== undefined)
          connection.sendFinger(room.outgoing.finger);
        for (const event of room.outgoing.events) connection.sendEvent(event);
      }
      for (const event of room.sounds) {
        const player = [...playersRef.current, ...room.residents].find(
          (candidate) => candidate.userId === event.userId
        );
        const cat = room.cats.find(
          (candidate) => candidate.userId === event.userId
        );
        if (player === undefined || cat === undefined) continue;
        sound.play({
          userId: event.userId,
          sound: event.sound,
          voice: player.voice,
          x: cat.x,
          size: player.look.size,
        });
      }
      lastCatsRef.current = room.cats;
      residentsRef.current = room.residents;
      const ownCatId = ownCatIdRef.current;
      const ownCatNow = room.cats.find((cat) => cat.userId === ownCatId);
      const isOwnCatHere = ownCatId !== undefined && ownCatNow !== undefined;
      if (isOwnCatHere !== ownCat.isHere) {
        ownCat.isHere = isOwnCatHere;
        setHasOwnCatInRoom(isOwnCatHere);
        if (ownCatNow !== undefined) centerXRef.current = ownCatNow.x;
      }
      const panDirection = Object.values(heldPanKeysRef.current).reduce<number>(
        (sum, direction) => sum + (direction ?? 0),
        0
      );
      centerXRef.current += Math.sign(panDirection) * KEY_PAN_SPEED * dtSeconds;
      const view = getWorldView({
        width,
        height,
        centerX: centerXRef.current,
      });
      centerXRef.current = (width / 2 - view.offsetX) / view.scale;
      const visibleWidth = width / view.scale;
      const isPannableNow = visibleWidth < ROOM_LIMITS.worldWidth;
      if (isPannableNow !== pan.isPannable) {
        pan.isPannable = isPannableNow;
        setIsPannable(isPannableNow);
      }
      if (isPannableNow)
        panBarRef.current?.draw({
          cats: room.cats,
          ownCatId,
          fromX: -view.offsetX / view.scale,
          visibleWidth,
        });
      for (const [key, element] of Object.entries(anchorsRef.current)) {
        if (element === undefined) continue;
        const userId = key.startsWith(COMPOSE_ANCHOR_PREFIX)
          ? key.slice(COMPOSE_ANCHOR_PREFIX.length)
          : key;
        const cat = room.cats.find((candidate) => candidate.userId === userId);
        if (cat === undefined) {
          element.style.visibility = "hidden";
          continue;
        }
        const halfWidth = element.offsetWidth / 2 + BUBBLE_EDGE_PX;
        const x = Math.min(
          Math.max(cat.head[0] * view.scale + view.offsetX, halfWidth),
          width - halfWidth
        );
        const y =
          (cat.head[1] - cat.head[2]) * view.scale +
          view.offsetY -
          BUBBLE_GAP_PX;
        element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        element.style.visibility = "visible";
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
  }, [engine, sound, connectionRef, playersRef, ownCatIdRef, roomIdRef]);

  function toWorld(event: React.PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const view = getWorldView({
      width: bounds.width,
      height: bounds.height,
      centerX: centerXRef.current,
    });
    return {
      x: (event.clientX - bounds.left - view.offsetX) / view.scale,
      y: (event.clientY - bounds.top - view.offsetY) / view.scale,
    };
  }

  function touchMidX() {
    const xs = Object.values(touchesRef.current).flatMap((x) =>
      x === undefined ? [] : [x]
    );
    return xs.reduce((sum, x) => sum + x, 0) / Math.max(1, xs.length);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.pointerType === "touch" && event.pointerId in touchesRef.current)
      touchesRef.current[event.pointerId] = event.clientX;
    const pinch = pinchRef.current;
    if (pinch !== undefined) {
      const scale = event.currentTarget.clientHeight / ROOM_LIMITS.worldHeight;
      centerXRef.current =
        pinch.startCenterX - (touchMidX() - pinch.startMidX) / scale;
      return;
    }
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
    if (event.pointerType === "touch")
      touchesRef.current[event.pointerId] = event.clientX;
    if (Object.keys(touchesRef.current).length >= 2) {
      restartPinch();
      engine.setOwnPointer({
        ...toWorld(event),
        present: false,
        pressed: false,
      });
      return;
    }
    if (pinchRef.current !== undefined) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    engine.setOwnPointer({ ...toWorld(event), present: true, pressed: true });
  }

  function restartPinch() {
    pinchRef.current = {
      startMidX: touchMidX(),
      startCenterX: centerXRef.current,
    };
  }

  function releaseTouch(pointerId: number) {
    delete touchesRef.current[pointerId];
    const isPinching = pinchRef.current !== undefined;
    if (Object.keys(touchesRef.current).length === 0)
      pinchRef.current = undefined;
    else if (isPinching) restartPinch();
    return isPinching;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (releaseTouch(event.pointerId)) return;
    engine.setOwnPointer({
      ...toWorld(event),
      present: event.pointerType === "mouse",
      pressed: false,
    });
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLCanvasElement>) {
    if (releaseTouch(event.pointerId)) return;
    engine.setOwnPointer({ ...toWorld(event), present: false, pressed: false });
  }

  async function handleSend(text: string) {
    const roomId = roomIdRef.current;
    if (!("userId" in session) || roomId === undefined) return "failed";
    const line = { id: crypto.randomUUID(), userId: session.userId, text };
    latestOwnLineIdRef.current = line.id;
    sound.playUi("chatSend");
    sayLine(line);
    if (useFakeRoom) return "sent";
    const result = await postChat({
      accessToken: session.accessToken,
      roomId,
      lineId: line.id,
      text,
    });
    if (result.kind !== "sent") {
      retractLine(line);
      sound.playUi("refused");
    }
    return result.kind;
  }

  function handleTalk() {
    sound.playUi("chatOpen");
    setIsComposing(true);
  }

  function readCenterX() {
    return centerXRef.current;
  }

  function handlePan(centerX: number) {
    centerXRef.current = centerX;
  }

  function handleReopenCompose() {
    setIsComposing(true);
  }

  function handleCloseCompose() {
    setIsComposing(false);
  }

  function handleToggleMute() {
    void sound.unlock();
    if (isMuted) {
      sound.setMuted(false);
      sound.playUi("soundOn");
    }
    setIsMuted(!isMuted);
  }

  function handleSwitchRoom(nextRoomId: string) {
    sound.playUi("stepNext");
    switchRoom(nextRoomId);
  }

  function handleLanguageChange() {
    sound.playUi("language");
  }

  function handleBringCatIn(cat: SavedCat) {
    sound.playUi("bringIn");
    setSavedCat(cat);
  }

  return (
    <UiSoundContext.Provider value={sound.playUi}>
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
        <RoomLoading
          text={
            isChecked &&
            !useFakeRoom &&
            "accessToken" in session &&
            roomId === undefined &&
            !isFull
              ? copy.room.findingRoom
              : undefined
          }
        />
        <div className="absolute top-4 right-4 flex items-center gap-x-2 group-has-[[aria-modal=true]]/room:hidden sm:top-6 sm:right-6">
          {roomId !== undefined && !useFakeRoom && "accessToken" in session && (
            <RoomPicker
              roomId={roomId}
              accessToken={session.accessToken}
              isPlayer={self !== undefined}
              onSwitch={handleSwitchRoom}
            />
          )}
          <LanguagePicker onChange={handleLanguageChange} />
          {hasOwnCatInRoom && (
            <button
              type="button"
              onClick={handleTalk}
              aria-keyshortcuts="/"
              className={cn(
                FOCUS_RING_CLASS,
                "flex h-10 items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
              )}
            >
              {copy.room.talk}
              <kbd
                aria-hidden
                className="grid size-5 place-items-center border border-[var(--pw-ink-soft)] font-[inherit] text-[11px] leading-none text-[var(--pw-ink-soft)] [@media(pointer:coarse)]:hidden"
              >
                /
              </kbd>
            </button>
          )}
          <SoundSwitch
            muted={isMuted}
            label={copy.room.mute}
            onToggle={handleToggleMute}
          />
          <PortfolioLink />
        </div>
        {isPannable && (
          <div className="absolute right-4 bottom-4 group-has-[[aria-modal=true]]/room:hidden max-[379px]:bottom-16 sm:right-6 sm:bottom-6">
            <PanBar
              label={copy.room.lookAround}
              centerX={readCenterX}
              handleRef={panBarRef}
              onPan={handlePan}
            />
          </div>
        )}
        <RoomBanner
          text={
            isFull
              ? copy.watch.roomFull
              : banner === undefined
                ? undefined
                : (banner.isMove
                    ? copy.room.roomMoved
                    : copy.room.roomEntered
                  ).replace(
                    "{room}",
                    copy.room.roomName.replace(
                      "{number}",
                      String(getRoomNumber(banner.roomId))
                    )
                  )
          }
        />
        <ChatLayer
          bubbles={bubbles}
          ownUserId={ownUserId}
          ownAccent={self === undefined ? RISO.pink : COAT_INKS[self.look.coat]}
          composing={isComposing && hasOwnCatInRoom}
          anchors={anchorsRef}
          onSend={handleSend}
          onCloseCompose={handleCloseCompose}
          onReopenCompose={handleReopenCompose}
        />
        <PawsOnboarding
          session={session}
          actions={actions}
          hasCat={savedCat !== undefined}
          onBringCatIn={handleBringCatIn}
        />
      </div>
    </UiSoundContext.Provider>
  );
}
