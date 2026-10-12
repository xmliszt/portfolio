"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { Mesh, Plane, Program, Renderer, Texture } from "ogl";

import type { NotebookPage as NotebookPageSettings } from "@/lib/laundromat/scene-config";

import { NOTEBOOK_PAGE_METRICS } from "./notebook-page-metrics";
import type { PageSpec } from "./paint-page-texture";
import { paintPageTexture } from "./paint-page-texture";
import { readPagePalette } from "./read-page-palette";

const PERSPECTIVE_PX = 2600;
const FOLD_START_RATIO = 1.15;
const LIFT_PADDING_RATIO = 0.08;
const WIDTH_SEGMENTS = 64;
const HEIGHT_SEGMENTS = 16;
const MAX_RESOLUTION = 3;

const VERTEX = /* glsl */ `
attribute vec2 uv;
uniform float uProgress;
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
void main() {
  vUv = uv;
  float x = uv.x * uWidth;
  float y = (1.0 - uv.y) * uHeight;
  vPoint = vec2(x, y);
  float bend = max(sin(uProgress * PI), 0.0);
  float radius = uWidth * 0.22 * uCurl * bend + 0.001;
  float tilt = uWidth * 0.3 * uCurl * bend;
  float lead = uGrab * (y / uHeight - 0.5) + 0.5 * abs(uGrab);
  float foldX = uWidth * ${FOLD_START_RATIO.toFixed(2)} * (1.0 - uProgress) - tilt * lead;
  float d = x - foldX;
  float px = x;
  float pz = 0.0;
  float angle = 0.0;
  if (d > 0.0) {
    angle = d / radius;
    if (angle < PI) {
      px = foldX + radius * sin(angle);
      pz = radius * (1.0 - cos(angle));
    } else {
      px = foldX - (d - PI * radius);
      pz = 2.0 * radius;
      angle = PI;
    }
  }
  float scale = ${PERSPECTIVE_PX.toFixed(1)} / (${PERSPECTIVE_PX.toFixed(1)} - pz);
  float sx = uWidth + px * scale;
  float sy = uPadding + uHeight * 0.5 + (y - uHeight * 0.5) * scale;
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

/** The progress at which the fold first reaches the leaf's outer edge. */
export const CURL_REST_PROGRESS = 1 - 1 / FOLD_START_RATIO;

type PageCurlCanvasProps = {
  turn: CurlTurn | undefined;
  progress: MotionValue<number>;
  settings: NotebookPageSettings;
  pitch: number;
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
  const { settings, pitch, curlStrength, progress, turn, onUnsupported } =
    props;
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
    const resolution = Math.min(
      (devicePixelRatio * canvas.getBoundingClientRect().width) / width,
      MAX_RESOLUTION
    );
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

    function draw(value: number) {
      program.uniforms.uProgress.value = value;
      renderer.render({ scene: mesh });
    }
    draw(progress.get());
    const unsubscribe = progress.on("change", draw);
    return () => {
      unsubscribe();
      renderer.gl.clear(renderer.gl.COLOR_BUFFER_BIT);
    };
  }, [turn, progress, settings, pitch, curlStrength, width, height]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0"
      style={{ top: -padding, width, height }}
    />
  );
}
