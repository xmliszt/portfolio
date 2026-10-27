import { getSunsetPalette } from "./get-sunset-palette";
import { SUNSET_FRAGMENT_SHADER } from "./sunset-fragment-shader";
import { SUNSET_SCENE_CONFIG } from "./sunset-scene-config";

type CreateSunsetRendererOptions = {
  canvas: HTMLCanvasElement;
  waveIterations: number;
};

type SunsetFrame = {
  timeS: number;
  sunY: number;
  exposure: number;
  sunVisibility: number;
  sunGlow: number;
  palette: ReturnType<typeof getSunsetPalette>;
  visibleHeightPx: number;
  ripples: Float32Array;
};

const VERTEX_SHADER =
  "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

const SCENE_UNIFORMS = {
  uHorizon: SUNSET_SCENE_CONFIG.horizon,
  uSunR: SUNSET_SCENE_CONFIG.sunRadius,
  uChop: SUNSET_SCENE_CONFIG.waveSteepness,
  uScale: SUNSET_SCENE_CONFIG.waveScale,
  uSpeed: SUNSET_SCENE_CONFIG.waveSpeed,
  uRough: SUNSET_SCENE_CONFIG.glitterSpread,
  uGlint: SUNSET_SCENE_CONFIG.glitterStrength,
  uIsland: SUNSET_SCENE_CONFIG.island,
  uSpread: SUNSET_SCENE_CONFIG.waveDirectionSpread,
  uHaze: SUNSET_SCENE_CONFIG.horizonHaze,
  uDof: SUNSET_SCENE_CONFIG.nearBlur,
  uSunI: SUNSET_SCENE_CONFIG.sunBrightness,
  uSat: SUNSET_SCENE_CONFIG.saturation,
  uContrast: SUNSET_SCENE_CONFIG.contrast,
  uBloom: SUNSET_SCENE_CONFIG.sunBloom,
};

/** Create a WebGL renderer that draws the sunset scene into `canvas`, or return `undefined` when WebGL is unavailable or the shader fails to build. */
export function createSunsetRenderer(options: CreateSunsetRendererOptions) {
  const gl = options.canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return undefined;
  const context = gl;

  let waveIterations = options.waveIterations;
  let program = build();
  if (!program) return undefined;

  function handleContextLost(event: Event) {
    event.preventDefault();
    program = undefined;
  }

  function handleContextRestored() {
    program = build();
  }

  options.canvas.addEventListener("webglcontextlost", handleContextLost);
  options.canvas.addEventListener(
    "webglcontextrestored",
    handleContextRestored
  );

  function compile(type: number, source: string) {
    const shader = context.createShader(type);
    if (!shader) return undefined;
    context.shaderSource(shader, source);
    context.compileShader(shader);
    if (context.getShaderParameter(shader, context.COMPILE_STATUS))
      return shader;
    console.error(context.getShaderInfoLog(shader));
    context.deleteShader(shader);
    return undefined;
  }

  function build() {
    const vertex = compile(context.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(
      context.FRAGMENT_SHADER,
      `#define ITER ${waveIterations}\n#define RIPPLES ${SUNSET_SCENE_CONFIG.rippleCount}\n#define RIPPLE_LIFE ${((SUNSET_SCENE_CONFIG.rippleCount * SUNSET_SCENE_CONFIG.rippleIntervalMs) / 1000).toFixed(2)}\n${SUNSET_FRAGMENT_SHADER}`
    );
    const linked = context.createProgram();
    if (!vertex || !fragment || !linked) return undefined;
    context.attachShader(linked, vertex);
    context.attachShader(linked, fragment);
    context.linkProgram(linked);
    context.deleteShader(vertex);
    context.deleteShader(fragment);
    if (!context.getProgramParameter(linked, context.LINK_STATUS)) {
      context.deleteProgram(linked);
      return undefined;
    }
    context.useProgram(linked);

    context.bindBuffer(context.ARRAY_BUFFER, context.createBuffer());
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      context.STATIC_DRAW
    );
    const position = context.getAttribLocation(linked, "a");
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

    for (const [name, value] of Object.entries(SCENE_UNIFORMS))
      context.uniform1f(context.getUniformLocation(linked, name), value);

    const uniform = (name: string) => context.getUniformLocation(linked, name);
    const uniforms = {
      uRes: uniform("uRes"),
      uTime: uniform("uTime"),
      uSunY: uniform("uSunY"),
      uExpo: uniform("uExpo"),
      uVis: uniform("uVis"),
      uGlow: uniform("uGlow"),
      uZen: uniform("uZen"),
      uMid: uniform("uMid"),
      uHor: uniform("uHor"),
      uSunC: uniform("uSunC"),
      uSea: uniform("uSea"),
      uRipples: uniform("uRipples"),
    };
    return { program: linked, uniforms };
  }

  return {
    setWaveIterations(iterations: number) {
      if (iterations === waveIterations || context.isContextLost()) return;
      waveIterations = iterations;
      if (program) context.deleteProgram(program.program);
      program = build();
    },
    render(frame: SunsetFrame) {
      if (!program) return;
      const uniforms = program.uniforms;
      context.viewport(0, 0, options.canvas.width, options.canvas.height);
      context.uniform2f(
        uniforms.uRes,
        options.canvas.width,
        frame.visibleHeightPx
      );
      context.uniform1f(uniforms.uTime, frame.timeS);
      context.uniform1f(uniforms.uSunY, frame.sunY);
      context.uniform1f(uniforms.uExpo, frame.exposure);
      context.uniform1f(uniforms.uVis, frame.sunVisibility);
      context.uniform1f(uniforms.uGlow, frame.sunGlow);
      context.uniform3fv(uniforms.uZen, frame.palette.zenith);
      context.uniform3fv(uniforms.uMid, frame.palette.mid);
      context.uniform3fv(uniforms.uHor, frame.palette.horizon);
      context.uniform3fv(uniforms.uSunC, frame.palette.sun);
      context.uniform3fv(uniforms.uSea, frame.palette.sea);
      context.uniform4fv(uniforms.uRipples, frame.ripples);
      context.drawArrays(context.TRIANGLES, 0, 3);
    },
    dispose() {
      options.canvas.removeEventListener("webglcontextlost", handleContextLost);
      options.canvas.removeEventListener(
        "webglcontextrestored",
        handleContextRestored
      );
      if (program && !context.isContextLost())
        context.deleteProgram(program.program);
      program = undefined;
    },
  };
}
