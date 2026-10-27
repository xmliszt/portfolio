import { clamp } from "lodash";

import { createOverscrollSpring } from "./create-overscroll-spring";
import { createSunsetRenderer } from "./create-sunset-renderer";
import { getSunsetPalette } from "./get-sunset-palette";
import { resolveSunsetQuality } from "./resolve-sunset-quality";
import { SUNSET_SCENE_CONFIG } from "./sunset-scene-config";

type CreateSunsetFooterControllerOptions = {
  viewport: HTMLElement;
  sheet: HTMLElement;
  footer: HTMLElement;
  canvas: HTMLCanvasElement;
  shade: HTMLElement;
};

const QUALITY_TIERS = {
  full: { waveIterations: 18, maxPixelRatio: 1.5, fps: 60 },
  lite: { waveIterations: 9, maxPixelRatio: 0.75, fps: 30 },
};

/** Map the scroll reveal of `footer` to the sun, run the overscroll spring on `viewport`, and render the scene while it shows; `dispose` removes every listener, attribute and inline style it set. */
export function createSunsetFooterController(
  options: CreateSunsetFooterControllerOptions
) {
  const config = SUNSET_SCENE_CONFIG;
  const viewport = options.viewport;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const spring = createOverscrollSpring({
    rubberLimitPx: config.rubberLimitPx,
    stiffness: config.springStiffness,
    damping: config.springDamping,
  });
  const originalOverscroll = viewport.style.overscrollBehaviorY;
  const originalSheetTransform = options.sheet.style.transform;

  let tier = QUALITY_TIERS[resolveSunsetQuality()];
  let renderer: ReturnType<typeof createSunsetRenderer>;
  let isRendererUnavailable = false;
  let clientHeightPx = 0;
  let sheetBottomPx = 0;
  let maxRevealPx = 1;
  let footerHeightPx = 1;
  let visibleHeightPx = 1;
  let sheetOffsetPx = 0;
  let shadeOpacity = -1;
  let isRevealed = false;
  let frameId = 0;
  let lastFrameMs = 0;
  let lastRenderMs = 0;
  let fpsAverage = 0;
  let slowSinceMs = 0;
  let lastScrollTop = viewport.scrollTop;
  let lastScrollMs = performance.now();
  let wheelTimer: ReturnType<typeof setTimeout> | undefined;
  let touchY = 0;
  const ripples = new Float32Array(config.rippleCount * 4);
  let rippleIndex = 0;
  let lastRippleMs = 0;
  let lastRippleX = 0;
  let lastRippleY = 0;

  function revealPx() {
    return viewport.scrollTop + clientHeightPx - sheetBottomPx;
  }

  function isAtBottom() {
    return viewport.scrollTop >= viewport.scrollHeight - clientHeightPx - 1;
  }

  function measure() {
    clientHeightPx = viewport.clientHeight;
    sheetBottomPx =
      options.sheet.getBoundingClientRect().bottom -
      sheetOffsetPx -
      viewport.getBoundingClientRect().top +
      viewport.scrollTop;
    maxRevealPx = Math.max(1, viewport.scrollHeight - sheetBottomPx);
    footerHeightPx = options.footer.offsetHeight;
    resizeCanvas();
    update();
  }

  function resizeCanvas() {
    if (!renderer) return;
    const scale = Math.min(window.devicePixelRatio || 1, tier.maxPixelRatio);
    const widthPx = Math.round(options.footer.clientWidth * scale);
    const heightPx = Math.round((footerHeightPx + config.skirtPx) * scale);
    visibleHeightPx = Math.round(footerHeightPx * scale);
    if (options.canvas.width !== widthPx) options.canvas.width = widthPx;
    if (options.canvas.height !== heightPx) options.canvas.height = heightPx;
  }

  function update() {
    const reveal = revealPx();
    if (!renderer && !isRendererUnavailable && reveal > -clientHeightPx) {
      renderer = createSunsetRenderer({
        canvas: options.canvas,
        waveIterations: tier.waveIterations,
      });
      isRendererUnavailable = renderer === undefined;
      resizeCanvas();
    }
    const nextRevealed = reveal > 0 || spring.isActive;
    if (nextRevealed !== isRevealed) {
      isRevealed = nextRevealed;
      if (isRevealed) document.documentElement.dataset.sunsetRevealed = "";
      else delete document.documentElement.dataset.sunsetRevealed;
    }
    viewport.style.overscrollBehaviorY =
      reveal > 0 ? "none" : originalOverscroll;
    requestFrame();
  }

  function requestFrame() {
    if (frameId === 0) frameId = requestAnimationFrame(loop);
  }

  function loop(nowMs: number) {
    frameId = 0;
    spring.step(lastFrameMs ? (nowMs - lastFrameMs) / 1000 : 0);
    lastFrameMs = nowMs;
    applySheetOffset();
    if (isRevealed && nowMs - lastRenderMs >= 1000 / tier.fps - 2) {
      trackFps(nowMs);
      render(nowMs);
    }
    if (shouldKeepLooping()) frameId = requestAnimationFrame(loop);
    else lastFrameMs = 0;
  }

  function shouldKeepLooping() {
    if (spring.isActive) return true;
    if (document.hidden) return false;
    return isRevealed && !reducedMotion.matches && renderer !== undefined;
  }

  function trackFps(nowMs: number) {
    if (lastRenderMs && nowMs - lastRenderMs < 200)
      fpsAverage = lerp(fpsAverage || 60, 1000 / (nowMs - lastRenderMs), 0.08);
    lastRenderMs = nowMs;
    if (tier !== QUALITY_TIERS.full || fpsAverage === 0 || fpsAverage >= 40) {
      slowSinceMs = 0;
      return;
    }
    slowSinceMs ||= nowMs;
    if (nowMs - slowSinceMs < 2000) return;
    tier = QUALITY_TIERS.lite;
    renderer?.setWaveIterations(tier.waveIterations);
    resizeCanvas();
  }

  function render(nowMs: number) {
    const progress = clamp(revealPx() / maxRevealPx, 0, 1);
    const sunRadius = config.sunRadius;
    const sunY =
      lerp(
        config.sunStart,
        config.horizon + config.sunRestRadii * sunRadius,
        progress
      ) -
      (spring.pullPx / 100) * config.overscrollDepthRadiiPer100Px * sunRadius;
    const elevationRadii = (sunY - config.horizon) / sunRadius;
    renderer?.render({
      timeS: sceneTimeS(nowMs),
      sunY,
      exposure:
        config.exposure * lerp(0.42, 1, smoothstep(-2.2, 0.5, elevationRadii)),
      sunVisibility: smoothstep(-1, 1, elevationRadii),
      sunGlow: smoothstep(-3, 0.5, elevationRadii),
      palette: getSunsetPalette(
        clamp((elevationRadii + 2) / config.colourSpanRadii, 0, 1)
      ),
      visibleHeightPx,
      ripples,
    });
    const nextShadeOpacity = config.sheetShadow * smoothstep(0, 0.25, progress);
    if (Math.abs(nextShadeOpacity - shadeOpacity) > 0.005) {
      shadeOpacity = nextShadeOpacity;
      options.shade.style.opacity = shadeOpacity.toFixed(3);
    }
  }

  function applySheetOffset() {
    const offsetPx = Math.max(
      -spring.pullPx * config.sheetFollow,
      -config.skirtPx
    );
    if (Math.abs(offsetPx - sheetOffsetPx) < 0.01) return;
    sheetOffsetPx = Math.abs(offsetPx) < 0.01 ? 0 : offsetPx;
    const transform =
      sheetOffsetPx === 0
        ? ""
        : `translate3d(0,${sheetOffsetPx.toFixed(2)}px,0)`;
    options.sheet.style.transform = transform || originalSheetTransform;
    options.shade.style.transform = transform;
  }

  function sceneTimeS(nowMs: number) {
    return reducedMotion.matches ? 40 : (nowMs / 1000) % 3600;
  }

  function handlePointerMove(event: PointerEvent) {
    if (event.pointerType === "touch" || reducedMotion.matches) return;
    const nowMs = performance.now();
    if (nowMs - lastRippleMs < config.rippleIntervalMs) return;
    const rect = options.footer.getBoundingClientRect();
    const depth = config.horizon - (rect.bottom - event.clientY) / rect.height;
    if (depth < 0.01) return;
    const speedPxPerMs =
      Math.hypot(event.clientX - lastRippleX, event.clientY - lastRippleY) /
      (nowMs - lastRippleMs);
    lastRippleMs = nowMs;
    lastRippleX = event.clientX;
    lastRippleY = event.clientY;
    const z = 1 / depth;
    const x = ((event.clientX - rect.left - rect.width / 2) / rect.height) * z;
    const strength = clamp(speedPxPerMs / 1.5, 0.2, 1);
    ripples.set([x, z, sceneTimeS(nowMs), strength], rippleIndex * 4);
    rippleIndex = (rippleIndex + 1) % config.rippleCount;
  }

  function release() {
    spring.release();
    update();
  }

  function pull(event: Event, deltaPx: number) {
    if (!spring.isDragging && !(isAtBottom() && deltaPx > 0)) return;
    if (spring.drag(deltaPx) && event.cancelable) event.preventDefault();
    update();
  }

  function handleWheel(event: WheelEvent) {
    const deltaUnitPx =
      event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? clientHeightPx : 1;
    pull(event, event.deltaY * deltaUnitPx);
    if (!spring.isDragging) return;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(release, 140);
  }

  function handleTouchStart(event: TouchEvent) {
    touchY = event.touches[0]?.clientY ?? touchY;
  }

  function handleTouchMove(event: TouchEvent) {
    const y = event.touches[0]?.clientY ?? touchY;
    const deltaPx = touchY - y;
    touchY = y;
    pull(event, deltaPx);
  }

  function handleScroll() {
    const nowMs = performance.now();
    const top = viewport.scrollTop;
    const velocityPxPerMs =
      (top - lastScrollTop) / Math.max(1, nowMs - lastScrollMs);
    const wasAtBottom =
      lastScrollTop >= viewport.scrollHeight - clientHeightPx - 1;
    if (
      isAtBottom() &&
      !wasAtBottom &&
      velocityPxPerMs > 0.4 &&
      !spring.isDragging
    )
      spring.push(Math.min(velocityPxPerMs * 1000 * config.flingDip, 1600));
    lastScrollTop = top;
    lastScrollMs = nowMs;
    update();
  }

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(viewport);
  resizeObserver.observe(options.sheet);
  viewport.addEventListener("scroll", handleScroll, { passive: true });
  viewport.addEventListener("wheel", handleWheel, { passive: false });
  viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
  viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
  viewport.addEventListener("touchend", release);
  viewport.addEventListener("touchcancel", release);
  options.footer.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("visibilitychange", requestFrame);
  reducedMotion.addEventListener("change", requestFrame);
  measure();

  return {
    dispose() {
      cancelAnimationFrame(frameId);
      clearTimeout(wheelTimer);
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("touchend", release);
      viewport.removeEventListener("touchcancel", release);
      options.footer.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", requestFrame);
      reducedMotion.removeEventListener("change", requestFrame);
      viewport.style.overscrollBehaviorY = originalOverscroll;
      options.sheet.style.transform = originalSheetTransform;
      options.shade.style.transform = "";
      options.shade.style.opacity = "";
      delete document.documentElement.dataset.sunsetRevealed;
      renderer?.dispose();
    },
  };
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
