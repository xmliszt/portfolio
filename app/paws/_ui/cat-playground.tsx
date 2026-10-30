"use client";

import { useEffect, useRef } from "react";

import type { CatLook } from "@/lib/paws/cat-look";
import { createSceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";
import { pruneScenePrints } from "@/lib/paws/render/prune-scene-prints";
import type {
  FingertipState,
  ScenePrint,
  WorldView,
} from "@/lib/paws/render/render-types";
import { stepFingertip } from "@/lib/paws/render/step-fingertip";
import { toScenePrint } from "@/lib/paws/render/to-scene-print";
import { createWorld } from "@/lib/paws/sim/create-world";
import { damp } from "@/lib/paws/sim/damp";
import { deriveCat } from "@/lib/paws/sim/derive-cat";
import { getCatSnapshots } from "@/lib/paws/sim/get-cat-snapshots";
import { stepWorld } from "@/lib/paws/sim/step-world";

import { PENDING_COPY } from "./pending-copy";

const CAT_ID = "playground";
const VIEW_SPAN = 560;
const CAMERA_RATE = 2.5;
const MAX_DT_SECONDS = 0.05;
const MAX_DPR = 2;

type CatPlaygroundProps = {
  look: CatLook;
};

/** Render a small private room with only the visitor's cat in it, running the real cat behaviour: it walks, sits, sleeps, sniffs and reaches for the visitor's fingertip, while the view follows it. */
export function CatPlayground(props: CatPlaygroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef(props.look);
  const pointerRef = useRef({ x: 0, y: 0, present: false, pressed: false });
  const viewRef = useRef<WorldView>({ scale: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    lookRef.current = props.look;
  }, [props.look]);

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
    const world = createWorld({ random: Math.random });
    const scene: {
      frame: number;
      lastMs: number;
      camera: { x: number; y: number } | undefined;
      prints: ScenePrint[];
      tip: FingertipState | undefined;
    } = {
      frame: 0,
      lastMs: performance.now(),
      camera: undefined,
      prints: [],
      tip: undefined,
    };

    function tick(nowMs: number) {
      if (canvas === null || g === null || g === undefined) return;
      const dtSeconds = Math.min(MAX_DT_SECONDS, (nowMs - scene.lastMs) / 1000);
      scene.lastMs = nowMs;
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
      const pointer = pointerRef.current;
      const look = lookRef.current;
      const { events } = stepWorld({
        world,
        players: [{ userId: CAT_ID, look }],
        fingers: pointer.present
          ? [
              {
                userId: CAT_ID,
                x: pointer.x,
                y: pointer.y,
                pressed: pointer.pressed,
              },
            ]
          : [],
        dtSeconds,
      });
      const cats = getCatSnapshots(world).map((snapshot) =>
        deriveCat({ snapshot, look, time: world.time })
      );
      const cat = cats.at(0);
      if (cat !== undefined) {
        scene.camera =
          scene.camera === undefined
            ? { x: cat.x, y: cat.y }
            : {
                x: damp({
                  from: scene.camera.x,
                  to: cat.x,
                  rate: CAMERA_RATE,
                  dtSeconds,
                }),
                y: damp({
                  from: scene.camera.y,
                  to: cat.y,
                  rate: CAMERA_RATE,
                  dtSeconds,
                }),
              };
      }
      const camera = scene.camera ?? {
        x: world.width / 2,
        y: world.height / 2,
      };
      const scale = Math.min(width, height) / VIEW_SPAN;
      viewRef.current = {
        scale,
        offsetX: width / 2 - camera.x * scale,
        offsetY: height / 2 - camera.y * scale,
      };
      scene.tip = stepFingertip({
        fingertip: scene.tip,
        input: pointer,
        dtSeconds,
      });
      const newPrints = events.flatMap((event) => {
        const print = toScenePrint({ event, look, time: world.time });
        return print === undefined ? [] : [print];
      });
      scene.prints = pruneScenePrints({
        prints: [...scene.prints, ...newPrints],
        time: world.time,
      });
      drawScene({
        g,
        width,
        height,
        dpr,
        view: viewRef.current,
        cats,
        prints: scene.prints,
        fingers: [{ ...scene.tip, kind: "own" }],
        time: world.time,
        resources,
      });
      scene.frame = window.requestAnimationFrame(tick);
    }

    scene.frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(scene.frame);
  }, []);

  function toWorld(event: React.PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const view = viewRef.current;
    return {
      x: (event.clientX - bounds.left - view.offsetX) / view.scale,
      y: (event.clientY - bounds.top - view.offsetY) / view.scale,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const pressed = (event.buttons & 1) === 1;
    pointerRef.current = {
      ...toWorld(event),
      present: event.pointerType === "mouse" || pressed,
      pressed,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = { ...toWorld(event), present: true, pressed: true };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    pointerRef.current = {
      ...toWorld(event),
      present: event.pointerType === "mouse",
      pressed: false,
    };
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLCanvasElement>) {
    pointerRef.current = { ...toWorld(event), present: false, pressed: false };
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={PENDING_COPY.previewLabel}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
      onPointerLeave={handlePointerLeave}
      className="block size-full touch-none border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper-deep)] [@media(pointer:fine)]:cursor-none"
    />
  );
}
