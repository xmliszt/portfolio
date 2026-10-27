type CreateOverscrollSpringOptions = {
  rubberLimitPx: number;
  stiffness: number;
  damping: number;
};

/** Create the overscroll pull state: a logarithmic rubber band while dragging and a damped spring back to 0 after release. */
export function createOverscrollSpring(options: CreateOverscrollSpringOptions) {
  let mode: "idle" | "drag" | "spring" = "idle";
  let pullPx = 0;
  let rawPx = 0;
  let velocityPxPerS = 0;

  function rubber(distancePx: number) {
    return (
      options.rubberLimitPx * Math.log10(1 + distancePx / options.rubberLimitPx)
    );
  }

  function unrubber(pulledPx: number) {
    return (
      options.rubberLimitPx * (10 ** (pulledPx / options.rubberLimitPx) - 1)
    );
  }

  return {
    get pullPx() {
      return pullPx;
    },
    get isActive() {
      return mode !== "idle";
    },
    get isDragging() {
      return mode === "drag";
    },
    /** Add `deltaPx` of finger or wheel travel past the edge and return `true` if the pull is still open; `false` once it is back at 0. */
    drag(deltaPx: number) {
      if (mode !== "drag") {
        rawPx = unrubber(Math.max(pullPx, 0));
        velocityPxPerS = 0;
        mode = "drag";
      }
      rawPx = Math.max(0, rawPx + deltaPx);
      pullPx = rubber(rawPx);
      if (rawPx > 0) return true;
      mode = "idle";
      return false;
    },
    release() {
      if (mode === "drag") mode = "spring";
    },
    push(addedVelocityPxPerS: number) {
      velocityPxPerS += addedVelocityPxPerS;
      mode = "spring";
    },
    step(dtS: number) {
      if (mode !== "spring") return;
      for (
        let remaining = Math.min(dtS, 0.05);
        remaining > 0;
        remaining -= 1 / 120
      ) {
        const h = Math.min(remaining, 1 / 120);
        velocityPxPerS +=
          (-options.stiffness * pullPx - options.damping * velocityPxPerS) * h;
        pullPx += velocityPxPerS * h;
      }
      if (Math.abs(pullPx) < 0.05 && Math.abs(velocityPxPerS) < 0.5) {
        pullPx = 0;
        velocityPxPerS = 0;
        mode = "idle";
      }
    },
  };
}
