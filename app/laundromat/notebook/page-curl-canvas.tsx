"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import { Mesh, Plane, Program, Renderer, Texture } from "ogl";

import type {
  NotebookPage as NotebookPageSettings,
  SceneConfig,
} from "@/lib/laundromat/scene-config";

import { CrayonFilter } from "./crayon-filter";
import { NOTEBOOK_PAGE_METRICS } from "./notebook-page-metrics";
import type { PageSpec } from "./paint-page-texture";
import { paintPageTexture } from "./paint-page-texture";
import { readPagePalette } from "./read-page-palette";

const PERSPECTIVE_PX = 2600;
const LIFT_PADDING_RATIO = 0.08;
const ARC_RATIO = 0.5;
const WIDTH_SEGMENTS = 64;
const HEIGHT_SEGMENTS = 48;
const MAX_RESOLUTION = 3;

const VERTEX = /* glsl */ `
attribute vec2 uv;
uniform float uProgress;
uniform float uDrop;
uniform float uArc;
uniform float uWidth;
uniform float uHeight;
uniform float uCurl;
uniform float uGrab;
uniform float uPadding;
uniform vec2 uCanvas;
varying vec2 vUv;
varying vec2 vPoint;
varying float vShade;
const float PI = 3.14159265;
vec2 limitReach(vec2 point, vec2 hinge, float maxDistance) {
  vec2 offset = point - hinge;
  float distance = length(offset);
  return distance > maxDistance ? hinge + offset / distance * maxDistance : point;
}
void main() {
  vUv = uv;
  vec2 point = vec2(uv.x * uWidth, (1.0 - uv.y) * uHeight);
  vPoint = point;
  vec2 grab = vec2(uWidth, (uGrab * 0.5 + 0.5) * uHeight);
  float arc = uArc * uWidth * ${ARC_RATIO.toFixed(2)} * uCurl * sin(uProgress * PI);
  vec2 target = vec2(
    min(uWidth * (1.0 - 2.0 * uProgress), uWidth),
    grab.y + uDrop * uHeight - sign(uGrab) * arc
  );
  vec2 top = vec2(0.0, 0.0);
  vec2 bottom = vec2(0.0, uHeight);
  float margin = 0.5 * PI * uWidth * 0.22 * uCurl * sin(clamp(length(grab - target) / (2.0 * uWidth), 0.0, 1.0) * PI);
  for (int i = 0; i < 2; i++) {
    target = limitReach(target, top, length(grab - top) - margin);
    target = limitReach(target, bottom, length(grab - bottom) - margin);
  }
  vec2 pull = grab - target;
  float reach = length(pull);
  vec2 normal = reach > 0.001 ? pull / reach : vec2(1.0, 0.0);
  float bend = sin(clamp(reach / (2.0 * uWidth), 0.0, 1.0) * PI);
  float radius = uWidth * 0.22 * uCurl * bend + 0.001;
  vec2 fold = grab - normal * (reach + PI * radius) * 0.5;
  fold += normal * max(0.0, max(dot(top - fold, normal), dot(bottom - fold, normal)));
  float d = dot(point - fold, normal);
  vec2 bent = point;
  float pz = 0.0;
  float angle = 0.0;
  if (d > 0.0) {
    vec2 base = point - normal * d;
    angle = d / radius;
    if (angle < PI) {
      bent = base + normal * radius * sin(angle);
      pz = radius * (1.0 - cos(angle));
    } else {
      bent = base - normal * (d - PI * radius);
      pz = 2.0 * radius;
      angle = PI;
    }
  }
  float scale = ${PERSPECTIVE_PX.toFixed(1)} / (${PERSPECTIVE_PX.toFixed(1)} - pz);
  float sx = uWidth + bent.x * scale;
  float sy = uPadding + uHeight * 0.5 + (bent.y - uHeight * 0.5) * scale;
  vShade = 0.72 + 0.28 * abs(cos(angle));
  gl_Position = vec4(sx / uCanvas.x * 2.0 - 1.0, 1.0 - sy / uCanvas.y * 2.0, -pz / 4000.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D tFront;
uniform sampler2D tBack;
uniform vec2 uPageSize;
uniform float uPixel;
varying vec2 vUv;
varying vec2 vPoint;
varying float vShade;
void main() {
  float radius = vUv.x < 0.5
    ? ${NOTEBOOK_PAGE_METRICS.cornerRadiusPx.spine.toFixed(1)}
    : ${NOTEBOOK_PAGE_METRICS.cornerRadiusPx.outer.toFixed(1)};
  vec2 corner = clamp(vPoint, vec2(radius), uPageSize - radius);
  float outside = length(vPoint - corner) - radius;
  float alpha = clamp(0.5 - outside / uPixel, 0.0, 1.0);
  if (alpha <= 0.0) discard;
  vec4 color = gl_FrontFacing
    ? texture2D(tFront, vUv)
    : texture2D(tBack, vec2(1.0 - vUv.x, vUv.y));
  gl_FragColor = vec4(color.rgb * vShade, alpha);
}
`;

export type CurlTurn = { front: PageSpec; back: PageSpec; grab: number };

type PageCurlCanvasProps = {
  turn: CurlTurn | undefined;
  progress: MotionValue<number>;
  drop: MotionValue<number>;
  arc: MotionValue<number>;
  settings: NotebookPageSettings;
  pitch: number;
  strokeWidthPx: number;
  crayon: SceneConfig["notebook"]["doodle"]["crayon"];
  curlStrength: number;
  onUnsupported: () => void;
};

type CurlScene = {
  renderer: Renderer;
  mesh: Mesh;
  program: Program;
  front: Texture;
  back: Texture;
  frontCanvas: HTMLCanvasElement;
  backCanvas: HTMLCanvasElement;
};

function createCurlScene(options: {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  padding: number;
}): CurlScene | undefined {
  try {
    const renderer = new Renderer({
      canvas: options.canvas,
      width: options.width,
      height: options.height,
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
      premultipliedAlpha: false,
    });
    const { gl } = renderer;
    gl.clearColor(0, 0, 0, 0);
    const frontCanvas = document.createElement("canvas");
    const backCanvas = document.createElement("canvas");
    const textureOptions = {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    };
    const front = new Texture(gl, textureOptions);
    const back = new Texture(gl, textureOptions);
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      cullFace: false,
      transparent: true,
      uniforms: {
        uProgress: { value: 0 },
        uDrop: { value: 0 },
        uArc: { value: 0 },
        uWidth: { value: options.width / 2 },
        uHeight: { value: options.height - options.padding * 2 },
        uCurl: { value: 0.5 },
        uGrab: { value: 1 },
        uPageSize: {
          value: [options.width / 2, options.height - options.padding * 2],
        },
        uPixel: { value: 1 },
        uPadding: { value: options.padding },
        uCanvas: { value: [options.width, options.height] },
        tFront: { value: front },
        tBack: { value: back },
      },
    });
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return undefined;
    }
    const geometry = new Plane(gl, {
      widthSegments: WIDTH_SEGMENTS,
      heightSegments: HEIGHT_SEGMENTS,
    });
    const mesh = new Mesh(gl, { geometry, program });
    return { renderer, mesh, program, front, back, frontCanvas, backCanvas };
  } catch {
    return undefined;
  }
}

export function PageCurlCanvas(props: PageCurlCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CurlScene>(undefined);
  const crayonFilterId = useId();
  const [resolution, setResolution] = useState(1);
  const {
    settings,
    pitch,
    strokeWidthPx,
    crayon,
    curlStrength,
    progress,
    drop,
    arc,
    turn,
    onUnsupported,
  } = props;
  const padding = Math.round(settings.height * LIFT_PADDING_RATIO);
  const width = settings.width * 2;
  const height = settings.height + padding * 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const scene = createCurlScene({ canvas, width, height, padding });
    if (scene === undefined) {
      onUnsupported();
      return;
    }
    sceneRef.current = scene;
    return () => {
      sceneRef.current = undefined;
      scene.renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [width, height, padding, onUnsupported]);

  const isTurning = turn !== undefined;
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    setResolution(
      Math.min(
        (window.devicePixelRatio * canvas.getBoundingClientRect().width) /
          width,
        MAX_RESOLUTION
      )
    );
  }, [isTurning, width]);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (scene === undefined || canvas === null) return;
    const { renderer, mesh, program } = scene;
    if (turn === undefined) {
      renderer.gl.clear(renderer.gl.COLOR_BUFFER_BIT);
      return;
    }
    const palette = readPagePalette(canvas);
    const { devicePixelRatio } = window;
    const crayonInk =
      "filter" in CanvasRenderingContext2D.prototype
        ? {
            filter: `url(#${CSS.escape(crayonFilterId)})`,
            bodyWidthScale: crayon.bodyWidthScale,
            bodyOpacity: crayon.bodyOpacity,
          }
        : undefined;
    if (renderer.dpr !== resolution) {
      renderer.dpr = resolution;
      renderer.setSize(width, height);
    }
    paintPageTexture({
      canvas: scene.frontCanvas,
      page: turn.front,
      side: "right",
      settings,
      pitch,
      strokeWidthPx,
      crayon: crayonInk,
      palette,
      devicePixelRatio,
      resolution,
    });
    paintPageTexture({
      canvas: scene.backCanvas,
      page: turn.back,
      side: "left",
      settings,
      pitch,
      strokeWidthPx,
      crayon: crayonInk,
      palette,
      devicePixelRatio,
      resolution,
    });
    scene.front.image = scene.frontCanvas;
    scene.back.image = scene.backCanvas;
    scene.front.needsUpdate = true;
    scene.back.needsUpdate = true;
    program.uniforms.uCurl.value = curlStrength;
    program.uniforms.uGrab.value = turn.grab;
    program.uniforms.uPixel.value = 1 / resolution;

    function draw() {
      program.uniforms.uProgress.value = progress.get();
      program.uniforms.uDrop.value = drop.get();
      program.uniforms.uArc.value = arc.get();
      renderer.render({ scene: mesh });
    }
    draw();
    const unsubscribes = [
      progress.on("change", draw),
      drop.on("change", draw),
      arc.on("change", draw),
    ];
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      renderer.gl.clear(renderer.gl.COLOR_BUFFER_BIT);
    };
  }, [
    turn,
    progress,
    drop,
    arc,
    settings,
    pitch,
    strokeWidthPx,
    crayon,
    crayonFilterId,
    curlStrength,
    resolution,
    width,
    height,
  ]);

  return (
    <>
      <svg aria-hidden className="absolute size-0">
        <CrayonFilter
          id={crayonFilterId}
          crayon={{
            ...crayon,
            grainFrequency: crayon.grainFrequency / resolution,
            patchFrequency: crayon.patchFrequency / resolution,
            wobbleFrequency: crayon.wobbleFrequency / resolution,
            edgeRoughnessPx: crayon.edgeRoughnessPx * resolution,
          }}
          seed={1}
        />
      </svg>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute left-0"
        style={{ top: -padding, width, height }}
      />
    </>
  );
}
